# AGENTS.md — fluido-data-viz (radice)

## Struttura del repository

Questo è un monorepo di visualizzazioni interattive didattiche di fluidodinamica. **Ogni progetto vive in una propria sottocartella** ed è completamente autonomo: HTML/CSS/JavaScript puro, nessuna dipendenza, nessuna build, nessun file condiviso tra progetti. Lingua dell'interfaccia e dei commenti: italiano.

| Cartella | Progetto |
|---|---|
| `cilindro-reynolds/` | Flusso attorno a un cilindro circolare al variare del numero di Reynolds |
| `kutta-web/` | Tunnel del vento 2D (kutta LBM) nel browser via WASM — profili NACA, angolo d'attacco, campi e fumo |

Alla radice ci sono solo: questo file, `README.md`, `index.html` (pagina indice che elenca i progetti, usata anche da GitHub Pages) e `.github/workflows/deploy.yml` (deploy dell'intero repo su GitHub Pages).

## Regole

- Ogni sottocartella di progetto ha il **proprio `AGENTS.md`** con architettura e convenzioni specifiche: leggilo prima di modificare quel progetto.
- Quando lavori su un progetto, non toccare file di altri progetti.
- Per avviare in locale servi la radice del repo (`python3 -m http.server 8123`) e naviga nella sottocartella.
- Se crei un nuovo progetto: nuova sottocartella kebab-case con `index.html`, `style.css`, `app.js`, `README.md`, `AGENTS.md`; aggiorna la tabella del `README.md` di radice, la pagina indice `index.html` e la tabella qui sopra.
