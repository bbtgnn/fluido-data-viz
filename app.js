"use strict";

/* ============================================================
   Proprietà dei fluidi (a 20 °C, pressione atmosferica)
   ρ [kg/m³], μ [Pa·s]
   ============================================================ */
const FLUIDS = [
  { id: "aria",      name: "Aria (20 °C)",       rho: 1.204, mu: 1.81e-5 },
  { id: "acqua",     name: "Acqua (20 °C)",      rho: 998.2, mu: 1.00e-3 },
  { id: "olio",      name: "Olio d'oliva",       rho: 915,   mu: 8.4e-2  },
  { id: "glicerina", name: "Glicerina",          rho: 1260,  mu: 1.41    },
];

/* Stato globale (variabili richieste: fluido, Re) */
const state = {
  fluid: FLUIDS[0],       // fluido: aria (default)
  logRe: 5,               // Re iniziale = 10^5
  diameter: 0.1,          // m
  paused: false,
};

const Re = () => Math.pow(10, state.logRe);

/* ============================================================
   Curva Cd(Re) per cilindro liscio (dati empirici, interp. log-log)
   ============================================================ */
const CD_TABLE = [
  [-1, 60], [0, 10.5], [0.7, 4.5], [1, 2.9], [2, 1.5], [3, 1.0],
  [4, 1.1], [5, 1.2], [5.45, 1.2], [5.65, 0.30], [6, 0.38], [6.5, 0.55], [7, 0.7],
];

function dragCoefficient(logRe) {
  const t = CD_TABLE;
  if (logRe <= t[0][0]) return t[0][1];
  if (logRe >= t[t.length - 1][0]) return t[t.length - 1][1];
  for (let i = 0; i < t.length - 1; i++) {
    const [x0, y0] = t[i], [x1, y1] = t[i + 1];
    if (logRe >= x0 && logRe <= x1) {
      const f = (logRe - x0) / (x1 - x0);
      return Math.pow(10, Math.log10(y0) + f * (Math.log10(y1) - Math.log10(y0)));
    }
  }
  return 1;
}

/* ============================================================
   Regimi di flusso in funzione di Re
   ============================================================ */
const REGIMES = [
  {
    max: 5, badge: "Flusso strisciante (Re < 5)",
    desc: "<strong>Flusso strisciante:</strong> le forze viscose dominano su quelle inerziali. Le linee di corrente aderiscono al cilindro e il flusso resta simmetrico e stazionario, senza separazione.",
  },
  {
    max: 47, badge: "Ricircolo stazionario (5 < Re < 47)",
    desc: "<strong>Bolle di ricircolo:</strong> il flusso si separa dietro il cilindro formando due vortici controrotanti stazionari e simmetrici, la cui lunghezza cresce con Re.",
  },
  {
    max: 400, badge: "Scia di von Kármán (47 < Re < 400)",
    desc: "<strong>Scia di von Kármán:</strong> la scia diventa instabile e i vortici si staccano alternativamente dai due lati con frequenza data dal numero di Strouhal (St ≈ 0,2). Scia laminare e periodica.",
  },
  {
    max: 3.5e5, badge: "Regime subcritico (400 < Re < 3,5·10⁵)",
    desc: "<strong>Regime subcritico:</strong> la scia è turbolenta ma lo strato limite sul cilindro resta laminare; la separazione avviene presto (~80°) e la scia è larga, con C<sub>d</sub> ≈ 1,2 quasi costante.",
  },
  {
    max: 3.5e6, badge: "Crisi della resistenza (Re > 3,5·10⁵)",
    desc: "<strong>Regime critico — crisi della resistenza:</strong> lo strato limite diventa turbolento prima di separarsi, la separazione arretra (~120°), la scia si restringe bruscamente e C<sub>d</sub> crolla a ~0,3.",
  },
  {
    max: Infinity, badge: "Regime transcritico (Re > 3,5·10⁶)",
    desc: "<strong>Regime transcritico:</strong> strato limite completamente turbolento; la scia torna leggermente più larga e C<sub>d</sub> risale verso ~0,7, restando poi quasi indipendente da Re.",
  },
];

function currentRegime() {
  const re = Re();
  return REGIMES.find((r) => re < r.max) || REGIMES[REGIMES.length - 1];
}

/* Parametri della scia, funzioni continue di log10(Re) */
function wakeParams() {
  const re = Re();
  const smooth = (a, b, x) => {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  };
  // Ampiezza dello shedding alternato (nasce a Re≈47)
  let shed = smooth(47, 300, re) * 0.85;
  // Turbolenza (fluttuazioni casuali nella scia)
  let turb = smooth(400, 2e4, re) * 0.9;
  // Larghezza scia: larga in subcritico, stretta dopo la drag crisis
  let width = 2.6;
  const crisis = smooth(3.0e5, 6e5, re);        // 0→1 attraverso la crisi
  const trans = smooth(3.5e6, 1e7, re);         // regime transcritico
  width = 2.6 - 1.3 * crisis + 0.5 * trans;
  shed *= 1 - 0.55 * crisis + 0.25 * trans;
  turb *= 1 + 0.3 * crisis;
  // Bolle di ricircolo stazionarie (5 < Re < 47)
  const bubble = smooth(5, 10, re) * (1 - smooth(40, 60, re));
  const bubbleLen = 0.4 + 1.6 * smooth(5, 47, re); // in raggi
  return { shed, turb, width, bubble, bubbleLen, crisis };
}

/* ============================================================
   Campo di velocità (unità: raggi di cilindro, U=1)
   Flusso potenziale attorno al cilindro + modello di scia
   ============================================================ */
function velocityField(x, y, t, p) {
  const r2 = x * x + y * y;
  let u, v;
  if (r2 < 1e-6) return { u: 0, v: 0 };
  // Flusso potenziale attorno a cilindro di raggio 1
  const inv4 = 1 / (r2 * r2);
  u = 1 - (x * x - y * y) * inv4;
  v = -2 * x * y * inv4;

  // --- Bolle di ricircolo stazionarie (coppia di vortici fissi) ---
  if (p.bubble > 0 && x > 0) {
    const vx = 1 + p.bubbleLen * 0.6;
    for (const sgn of [1, -1]) {
      const dx = x - vx, dy = y - sgn * 0.55;
      const d2 = dx * dx + dy * dy + 0.15;
      const G = (sgn * 0.9 * p.bubble) / d2;
      u += -G * dy;
      v += G * dx;
    }
  }

  // --- Scia di von Kármán: onda trasversale che viaggia a ~0.8U ---
  if (p.shed > 0 && x > 0.3) {
    const lambda = 4.5;                 // lunghezza d'onda in raggi
    const k = (2 * Math.PI) / lambda;
    const omega = k * 0.8;              // velocità di fase 0.8 U
    const env =
      Math.exp(-(y * y) / (p.width * p.width)) *
      Math.min(1, x / 2.5) *
      Math.exp(-x / 28);
    const phase = k * x - omega * t;
    v += p.shed * env * Math.sin(phase);
    u += p.shed * 0.35 * env * Math.sin(2 * phase + 1.3) - 0.25 * env * p.shed;
  }

  return { u, v };
}

/* ============================================================
   Vortici turbolenti (eddies): strutture coerenti che nascono
   dietro il cilindro, vengono trasportate a valle e si dissipano.
   Sono loro a produrre il moto caotico visibile nella scia.
   Unità: raggi di cilindro, velocità in unità di U.
   ============================================================ */
const eddies = [];
const MAX_EDDIES = 60;
let eddyAcc = 0; // accumulatore per lo spawn frazionario

function spawnEddy(p) {
  const r = 0.35 + Math.random() * 0.95;            // dimensione del vortice
  eddies.push({
    x: 0.9 + Math.random() * 1.8,                   // nasce appena dietro il cilindro
    y: (Math.random() - 0.5) * p.width * 1.1,
    r,
    // intensità: picco di velocità tangenziale, segno casuale
    s: (Math.random() < 0.5 ? -1 : 1) * (0.5 + Math.random() * 0.9) * p.turb,
    drift: 0.7 + Math.random() * 0.2,               // velocità di trasporto a valle
    tau: 5 + Math.random() * 7,                     // tempo di dissipazione
  });
}

function updateEddies(dtN, p) {
  // tasso di generazione proporzionale all'intensità turbolenta
  eddyAcc += 3.2 * p.turb * dtN;
  while (eddyAcc >= 1 && eddies.length < MAX_EDDIES) {
    spawnEddy(p);
    eddyAcc -= 1;
  }
  eddyAcc = Math.min(eddyAcc, 2);

  for (let i = eddies.length - 1; i >= 0; i--) {
    const e = eddies[i];
    e.x += e.drift * dtN;
    e.y += (Math.random() - 0.5) * 0.35 * dtN;      // lento vagabondaggio laterale
    e.s *= Math.exp(-dtN / e.tau);                   // dissipazione viscosa
    if (e.x > 17 || Math.abs(e.s) < 0.04) eddies.splice(i, 1);
  }
}

/* Velocità indotta dai vortici in (x, y) — vortice algebrico tipo Lamb */
function eddyVelocity(x, y) {
  let u = 0, v = 0;
  for (const e of eddies) {
    const dx = x - e.x, dy = y - e.y;
    const d2 = dx * dx + dy * dy;
    if (d2 > 20) continue;                           // cutoff a ~4.5 raggi
    const G = (e.s * e.r) / (d2 + e.r * e.r);
    u += -G * dy;
    v += G * dx;
  }
  return { u, v };
}

/* ============================================================
   Setup canvas e particelle
   ============================================================ */
const canvas = document.getElementById("flow");
// Su schermi piccoli: canvas più quadrato (la scia resta leggibile) e meno particelle
const IS_MOBILE = window.matchMedia("(max-width: 640px)").matches;
if (IS_MOBILE) {
  canvas.width = 640;
  canvas.height = 480;
}
const ctx = canvas.getContext("2d");
const W = canvas.width, H = canvas.height;
const CX = IS_MOBILE ? 190 : 280, CY = H / 2;
// Raggio a schermo: scala log con il diametro (0,01 m → 20 px, 1 m → 70 px)
const cylinderRadiusPx = () => 45 + 25 * (Math.log10(state.diameter) + 1);

const N_PART = IS_MOBILE ? 900 : 1500;
const particles = [];

function spawn(p, anywhere) {
  p.x = anywhere ? Math.random() * W : -Math.random() * 60;
  p.y = Math.random() * H;
  p.px = p.x;
  p.py = p.y;
  p.life = 400 + Math.random() * 800;
}

function initParticles() {
  particles.length = 0;
  for (let i = 0; i < N_PART; i++) {
    const p = {};
    spawn(p, true);
    particles.push(p);
  }
}
initParticles();

/* ============================================================
   Loop di animazione
   ============================================================ */
let simTime = 0;
let lastTs = null;
const U_DISP = 110; // velocità di riferimento a schermo [px/s]

function step(dtReal) {
  const p = wakeParams();
  const R = cylinderRadiusPx();
  const dt = Math.min(dtReal, 0.05);
  const dtN = dt * (U_DISP / R); // passo adimensionale (unità R/U)
  simTime += dtN;

  if (p.turb > 0) updateEddies(dtN, p);
  else if (eddies.length) eddies.length = 0;

  // dissolvenza per le scie
  ctx.fillStyle = "rgba(5, 7, 12, 0.13)";
  ctx.fillRect(0, 0, W, H);

  for (const q of particles) {
    // coordinate adimensionali rispetto al cilindro
    const xn = (q.x - CX) / R;
    const yn = (q.y - CY) / R;
    const { u, v } = velocityField(xn, yn, simTime, p);

    // turbolenza: vortici coerenti + un residuo di agitazione fine
    let nu = 0, nv = 0;
    if (p.turb > 0 && xn > 0.3) {
      const ev = eddyVelocity(xn, yn);
      nu = ev.u;
      nv = ev.v;
      const env = Math.exp(-(yn * yn) / (p.width * p.width)) * Math.min(1, xn / 2);
      const a = p.turb * env * 0.25;
      nu += (Math.random() - 0.5) * a;
      nv += (Math.random() - 0.5) * a;
    }

    q.px = q.x;
    q.py = q.y;
    q.x += (u + nu) * U_DISP * dt;
    q.y += (v + nv) * U_DISP * dt;
    q.life -= 1;

    const dx = q.x - CX, dy = q.y - CY;
    const inside = dx * dx + dy * dy < R * R;
    if (q.x > W + 10 || q.x < -80 || q.y < -20 || q.y > H + 20 || inside || q.life <= 0) {
      // vita scaduta: rinasce in un punto casuale per mantenere densità uniforme
      spawn(q, q.life <= 0);
      continue;
    }

    // colore in base alla velocità locale
    const speed = Math.min(1.6, Math.hypot(u + nu, v + nv));
    const hue = 220 - (speed / 1.6) * 195; // blu (lento) → arancio (veloce)
    ctx.strokeStyle = `hsla(${hue}, 92%, ${48 + speed * 14}%, 0.9)`;
    ctx.lineWidth = 1.3;
    ctx.beginPath();
    ctx.moveTo(q.px, q.py);
    ctx.lineTo(q.x, q.y);
    ctx.stroke();
  }

  // cilindro
  const grad = ctx.createRadialGradient(CX - 12, CY - 12, 6, CX, CY, R);
  grad.addColorStop(0, "#3d444d");
  grad.addColorStop(1, "#1c2128");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(CX, CY, R, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#58a6ff";
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

function frame(ts) {
  if (lastTs === null) lastTs = ts;
  const dt = (ts - lastTs) / 1000;
  lastTs = ts;
  if (!state.paused) step(dt);
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

/* ============================================================
   Grafico Cd(Re)
   ============================================================ */
const cdCanvas = document.getElementById("cdChart");
const cdCtx = cdCanvas.getContext("2d");

function drawCdChart() {
  const w = cdCanvas.width, h = cdCanvas.height;
  const mL = 34, mR = 8, mT = 8, mB = 22;
  const X = (lr) => mL + ((lr - 0) / 7) * (w - mL - mR);
  const Y = (cd) => {
    const lo = Math.log10(0.2), hi = Math.log10(100);
    return mT + (1 - (Math.log10(cd) - lo) / (hi - lo)) * (h - mT - mB);
  };

  cdCtx.clearRect(0, 0, w, h);

  // griglia
  cdCtx.strokeStyle = "#2d333b";
  cdCtx.fillStyle = "#8b949e";
  cdCtx.font = "10px sans-serif";
  cdCtx.lineWidth = 1;
  for (let e = 0; e <= 7; e++) {
    const x = X(e);
    cdCtx.beginPath(); cdCtx.moveTo(x, mT); cdCtx.lineTo(x, h - mB); cdCtx.stroke();
    if (e % 2 === 1 || e === 0) cdCtx.fillText("10" + "⁰¹²³⁴⁵⁶⁷"[e], x - 8, h - 8);
  }
  for (const cd of [0.3, 1, 3, 10, 30, 100]) {
    const y = Y(cd);
    cdCtx.beginPath(); cdCtx.moveTo(mL, y); cdCtx.lineTo(w - mR, y); cdCtx.stroke();
    cdCtx.fillText(String(cd), 4, y + 3);
  }

  // curva
  cdCtx.strokeStyle = "#f78166";
  cdCtx.lineWidth = 2;
  cdCtx.beginPath();
  for (let lr = 0; lr <= 7.001; lr += 0.02) {
    const x = X(lr), y = Y(dragCoefficient(lr));
    lr === 0 ? cdCtx.moveTo(x, y) : cdCtx.lineTo(x, y);
  }
  cdCtx.stroke();

  // punto corrente
  const px = X(state.logRe), py = Y(dragCoefficient(state.logRe));
  cdCtx.fillStyle = "#58a6ff";
  cdCtx.beginPath();
  cdCtx.arc(px, py, 5, 0, Math.PI * 2);
  cdCtx.fill();
  cdCtx.strokeStyle = "#e6edf3";
  cdCtx.lineWidth = 1.5;
  cdCtx.stroke();
}

/* ============================================================
   Readout fisico e UI
   ============================================================ */
function fmt(x, digits = 3) {
  if (x === 0) return "0";
  const a = Math.abs(x);
  if (a >= 1e5 || a < 1e-3) return x.toExponential(2).replace("e", "·10^").replace("+", "");
  return x.toLocaleString("it-IT", { maximumSignificantDigits: digits });
}

function updateReadout() {
  const re = Re();
  const f = state.fluid;
  const D = state.diameter;
  const nu = f.mu / f.rho;
  const U = (re * nu) / D;                    // velocità del flusso indisturbato
  const cd = dragCoefficient(state.logRe);
  const drag = 0.5 * f.rho * U * U * D * cd;  // forza per unità di lunghezza [N/m]
  const shedding = re > 47;
  const St = 0.198 * (1 - 19.7 / re);         // correlazione di Roshko
  const freq = shedding ? (St * U) / D : null;

  const rows = [
    ["Densità ρ", `${fmt(f.rho)} kg/m³`],
    ["Viscosità dinamica μ", `${fmt(f.mu)} Pa·s`],
    ["Viscosità cinematica ν", `${fmt(nu)} m²/s`],
    ["Diametro D", `${fmt(D)} m`],
    ["Velocità U∞ (da Re)", `${fmt(U)} m/s`],
    ["Numero di Reynolds", fmt(re, 3)],
    ["Coeff. resistenza C_d", fmt(cd, 3)],
    ["Resistenza per metro", `${fmt(drag)} N/m`],
    ["Freq. distacco vortici", freq ? `${fmt(freq)} Hz` : "— (nessun distacco)"],
  ];
  document.getElementById("physReadout").innerHTML = rows
    .map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`)
    .join("");

  const regime = currentRegime();
  document.getElementById("regimeBadge").textContent = regime.badge;
  document.getElementById("regimeDescription").innerHTML = regime.desc;

  const exp = Math.floor(state.logRe);
  const mant = Math.pow(10, state.logRe - exp);
  document.getElementById("reValue").innerHTML =
    mant > 1.05 ? `${mant.toFixed(1)}·10<sup>${exp}</sup>` : `10<sup>${exp}</sup>`;
  document.getElementById("diamValue").textContent = `${fmt(D)} m`;

  drawCdChart();
}

/* ---- Collegamento controlli ---- */
const fluidSelect = document.getElementById("fluidSelect");
FLUIDS.forEach((f) => {
  const o = document.createElement("option");
  o.value = f.id;
  o.textContent = f.name;
  fluidSelect.appendChild(o);
});
fluidSelect.addEventListener("change", () => {
  state.fluid = FLUIDS.find((f) => f.id === fluidSelect.value);
  updateReadout();
});

document.getElementById("reSlider").addEventListener("input", (e) => {
  state.logRe = parseFloat(e.target.value);
  updateReadout();
});

document.getElementById("diamSlider").addEventListener("input", (e) => {
  state.diameter = Math.pow(10, parseFloat(e.target.value));
  updateReadout();
});

document.getElementById("pauseBtn").addEventListener("click", (e) => {
  state.paused = !state.paused;
  e.target.textContent = state.paused ? "▶ Riprendi" : "⏸ Pausa";
});

document.getElementById("resetBtn").addEventListener("click", () => {
  ctx.fillStyle = "#05070c";
  ctx.fillRect(0, 0, W, H);
  initParticles();
  eddies.length = 0;
});

// Sincronizza lo stato con i controlli (il browser può ripristinare i valori dei form al reload)
state.logRe = parseFloat(document.getElementById("reSlider").value);
state.diameter = Math.pow(10, parseFloat(document.getElementById("diamSlider").value));
state.fluid = FLUIDS.find((f) => f.id === fluidSelect.value) || FLUIDS[0];

updateReadout();
