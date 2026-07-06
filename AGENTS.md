# AGENTS.md — fluido-data-viz (radice)

## Struttura del repository

Questo è un monorepo di visualizzazioni interattive didattiche di fluidodinamica. **Ogni progetto vive in una propria sottocartella** ed è autonomo: nessun file condiviso tra progetti. Lingua dell'interfaccia e dei commenti: italiano.

| Cartella | Progetto | Stack |
|---|---|---|
| `cilindro-reynolds/` | Flusso attorno a un cilindro circolare al variare del numero di Reynolds | HTML/CSS/JS puro, nessuna build |
| `kutta-web/` | Tunnel del vento 2D (kutta LBM) nel browser via WASM — profili NACA, angolo d'attacco, campi e fumo | Go → WASM, submodule git, build in CI |

Alla radice: questo file, `README.md`, `index.html` (pagina indice per GitHub Pages), `.gitmodules` (submodule kutta), `.github/workflows/deploy.yml` (deploy Pages; per kutta-web compila anche il WASM).

## Regole

- Ogni sottocartella di progetto ha il **proprio `AGENTS.md`** con architettura e convenzioni specifiche: leggilo prima di modificare quel progetto.
- Quando lavori su un progetto, non toccare file di altri progetti.
- Per avviare in locale servi la radice del repo (`python3 -m http.server 8123`) e naviga nella sottocartella del progetto.
- **Nuovo progetto (default):** sottocartella kebab-case con `index.html`, `style.css`, `app.js`, `README.md`, `AGENTS.md`; aggiorna tabella in `README.md`, link in `index.html` e tabella qui sopra.
- **Eccezione `kutta-web`:** vedi [`kutta-web/AGENTS.md`](kutta-web/AGENTS.md) — submodule, overlay Go, script di build, artefatti WASM generati (non committati).
