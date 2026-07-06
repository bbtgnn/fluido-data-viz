# AGENTS.md — cilindro-reynolds

Questo è uno dei progetti del monorepo `fluido-data-viz` (vedi `AGENTS.md` alla radice). Tutti i file del progetto stanno in questa cartella.

## Cos'è il progetto

Visualizzazione interattiva didattica del flusso esterno attorno a un cilindro circolare al variare del numero di Reynolds (Re da 10⁰ a 10⁷, default 10⁵). Il fluido è selezionabile (default: aria a 20 °C). Simulazione a particelle su canvas HTML5: non è una CFD, ma un modello cinematico che riproduce l'aspetto qualitativo dei regimi di flusso reali con grandezze fisiche derivate corrette.

## Stack e avvio

HTML/CSS/JavaScript puro, **nessuna dipendenza, nessuna build**. Lingua dell'interfaccia e dei commenti: italiano.

```bash
# dalla radice del repo
python3 -m http.server 8123
# apri http://localhost:8123/cilindro-reynolds/
```

Va servito via HTTP oppure aperto direttamente come file; non ci sono moduli ES, `app.js` è un unico script classico caricato in fondo a `index.html`.

## File

| File | Contenuto |
|---|---|
| `index.html` | Struttura della pagina: canvas principale `#flow`, pannello controlli, riquadro grandezze fisiche, canvas grafico `#cdChart`, descrizione regime |
| `style.css` | Tema scuro (variabili CSS in `:root`), layout flex |
| `app.js` | Tutta la logica: dati fisici, modello del flusso, particelle, vortici turbolenti, grafico, UI |
| `README.md` | Documentazione utente |

## Architettura di `app.js` (ordine nel file)

1. **`FLUIDS`** — proprietà reali (ρ, μ) di aria, acqua, olio d'oliva, glicerina a 20 °C.
2. **`state`** — stato globale: `fluid`, `logRe` (slider logaritmico, Re = 10^logRe), `diameter` [m], `paused`.
3. **`CD_TABLE` / `dragCoefficient(logRe)`** — curva empirica C_d(Re) per cilindro liscio, interpolata log-log. Include la crisi della resistenza (crollo a ~0,3 attorno a Re ≈ 3,5·10⁵).
4. **`REGIMES` / `currentRegime()`** — sei regimi con soglie a Re = 5, 47, 400, 3,5·10⁵, 3,5·10⁶; badge e descrizione HTML mostrati nella UI.
5. **`wakeParams()`** — trasforma Re nei parametri continui del modello di scia (`shed`, `turb`, `width`, `bubble`, `bubbleLen`, `crisis`) usando smoothstep, così le transizioni tra regimi sono graduali.
6. **`velocityField(x, y, t, p)`** — campo di velocità deterministico: flusso potenziale attorno al cilindro + coppia di vortici di ricircolo stazionari (5 < Re < 47) + onda sinusoidale di von Kármán che viaggia a 0,8 U.
7. **Vortici turbolenti (`eddies`)** — il moto caotico della scia. Vortici algebrici tipo Lamb con posizione/dimensione/intensità/segno casuali: nascono dietro il cilindro con tasso ∝ `turb`, vengono avvettati a valle, decadono esponenzialmente (`tau`), rimossi oltre x = 17 raggi o sotto soglia d'intensità. `eddyVelocity(x, y)` somma i loro contributi con cutoff a ~4,5 raggi. Sono la fonte primaria del "caos" visivo; il rumore bianco residuo è solo micro-agitazione.
8. **Particelle e loop** — ~1500 particelle traccianti avvettate dal campo totale; scie disegnate come segmenti con dissolvenza (fill semitrasparente per frame); colore = velocità locale (blu lento → arancio veloce). `step()` è il cuore del loop.
9. **Grafico C_d(Re)** — `drawCdChart()` su canvas separato, con punto blu che segue lo slider.
10. **Readout e UI** — `updateReadout()` ricalcola tutte le grandezze derivate e ridisegna il grafico; listener per fluido, Re, diametro, pausa, reset. In fondo al file lo stato viene risincronizzato con i valori dei form (il browser può ripristinarli al reload).

## Convenzioni fisiche e di coordinate — importanti

- **Unità adimensionali nella simulazione**: lunghezze in *raggi di cilindro*, velocità in unità di U∞ (= 1), tempo in unità R/U. La conversione a pixel avviene solo in `step()` tramite `U_DISP` (px/s) e `cylinderRadiusPx()`.
- Il raggio a schermo **dipende dal diametro selezionato** (`cylinderRadiusPx()`, scala log): se tocchi il loop, ricava `R` da lì, non da costanti.
- **Grandezze derivate**: la velocità U∞ è *ricavata* da Re (U = Re·ν/D), non impostata direttamente. Resistenza per metro = ½ρU²D·C_d. Frequenza di distacco vortici dalla correlazione di Roshko St = 0,198(1 − 19,7/Re), mostrata solo per Re > 47.
- Le transizioni tra regimi devono restare **continue in Re** (smoothstep in `wakeParams()`): non introdurre discontinuità a gradino nei parametri visivi.

## Cose da sapere prima di modificare

- Il numero formattato usa `toLocaleString("it-IT")` → virgola decimale.
- `updateReadout()` va chiamata dopo ogni cambiamento di stato che tocca fisica o grafico.
- Il pulsante "Reset particelle" azzera anche `eddies`; se aggiungi altro stato di simulazione, azzeralo lì.
- Prestazioni: il costo dominante è particelle × vortici in `eddyVelocity` (~1500 × ≤60 con cutoff early-continue). Se aumenti `N_PART` o `MAX_EDDIES`, verifica il frame rate.
- Non ci sono test automatici: la verifica si fa a occhio nel browser (regimi ai vari Re) e controllando i numeri del readout contro la teoria (es. aria, Re = 100, D = 0,1 m → U∞ = 0,015 m/s, f ≈ 0,024 Hz).
