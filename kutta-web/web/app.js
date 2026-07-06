(function () {
  const overlay = document.getElementById("loadOverlay");
  const errorBox = document.getElementById("loadError");
  const frame = document.getElementById("gameFrame");

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
