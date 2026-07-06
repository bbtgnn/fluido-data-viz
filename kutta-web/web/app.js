(function () {
  const SIM_W = 1380;
  const SIM_H = 756;

  const overlay = document.getElementById("loadOverlay");
  const errorBox = document.getElementById("loadError");
  const frame = document.getElementById("gameFrame");
  const panel = frame.closest(".viz-panel");

  function fitFrame() {
    if (!panel) return;
    const w = panel.clientWidth;
    if (!w) return;
    const scale = w / SIM_W;
    frame.style.width = SIM_W + "px";
    frame.style.height = SIM_H + "px";
    frame.style.transform = "scale(" + scale + ")";
  }

  window.addEventListener("resize", fitFrame);
  window.addEventListener("load", fitFrame);
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(fitFrame).observe(panel);
  }
  fitFrame();

  function hideOverlay() {
    overlay.classList.add("hidden");
  }

  function showError(message) {
    hideOverlay();
    errorBox.style.display = "block";
    errorBox.textContent = message;
  }

  window.addEventListener("message", (event) => {
    if (event.source !== frame.contentWindow) return;
    const data = event.data;
    if (!data || typeof data.type !== "string") return;

    if (data.type === "kutta-ready") {
      hideOverlay();
    }
    if (data.type === "kutta-error") {
      showError(data.message);
    }
  });

  frame.addEventListener("load", () => {
    fitFrame();
    // Se il WASM impiega molto, l'overlay resta finché non arriva kutta-ready.
    setTimeout(() => {
      if (!overlay.classList.contains("hidden")) {
        // Nessun segnale dopo 120 s: probabile problema di rete o build mancante.
        showError(
          "La simulazione non si è avviata. Verifica che kutta.wasm sia presente " +
            "(esegui kutta-web/scripts/build.sh) e che la pagina sia servita via HTTP."
        );
      }
    }, 120000);
  });
})();
