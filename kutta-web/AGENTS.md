# AGENTS.md — kutta-web

Progetto del monorepo `fluido-data-viz` (vedi `AGENTS.md` alla radice). **Eccezione alle regole standard:** richiede Go ≥ 1.26, submodule git e build WASM.

## Cos'è

Simulazione didattica del tunnel del vento 2D [kutta](https://github.com/crgimenes/kutta) nel browser. Il solver LBM (`kutta/lbm`), la geometria NACA (`kutta/foil`) e la visualizzazione (`kutta/viz`) girano in WASM via Ebitengine.

**Scope browser (sim-only):** profili NACA, angolo d'attacco, campi scalari, streamline, fumo, Cl/Cd. **Disabilitato in WASM:** editor (`E`), apertura/salvataggio scene (`O`, Cmd+S), pulsanti toolbar Edit/Open/Save/Save As (nascosti in `toolbar_js.go`).

## Stack

- **Submodule:** `kutta/` → `https://github.com/crgimenes/kutta` (branch `trunk`)
- **Overlay:** patch Go con build tag `js && wasm` (non modificare il submodule)
- **Stub:** `stubs/native/` sostituisce `github.com/crgimenes/native` (filedialog, clipboard no-op)
- **Build:** `scripts/build.sh` compila in directory temporanea con `GOOS=js GOARCH=wasm`
- **Web:** `web/index.html` (shell italiana) + `web/game.html` (loader WASM in iframe)

## Struttura cartelle

| Percorso | Contenuto |
|---|---|
| `kutta/` | Submodule upstream (non committare modifiche locali) |
| `overlay/` | Patch WASM copiate in temp a ogni build |
| `stubs/native/` | Modulo `replace` per API desktop non disponibili nel browser |
| `scripts/build.sh` | Orchestrazione build |
| `scripts/strip_funcs.py` | Rimuove metodi desktop duplicati da `game.go` / `editor.go` |
| `web/` | Shell HTML + artefatti generati (`kutta.wasm`, `wasm_exec.js`) |
| `go.work` | Workspace locale (opzionale per sviluppo) |

### `overlay/` (build tag `js && wasm`)

| File | Ruolo |
|---|---|
| `main_js.go` | Entry point WASM (senza icona finestra né resize nativo) |
| `icon_js.go` | `setWindowIcon()` no-op |
| `input_js.go` | No-op per `toggleEdit`, `openSceneDialog`, `saveScene`, `saveSceneAs` |
| `toolbar_js.go` | `runSimToolbar()` senza pulsanti Edit/Open/Save/Save As |

A ogni build, `main.go` e `icon.go` del submodule ricevono `//go:build !(js && wasm)` così convivono con gli overlay.

## Build WASM

```bash
./kutta-web/scripts/build.sh
```

Lo script:
1. Inizializza submodule `kutta-web/kutta`
2. Copia `kutta/` in directory temporanea + `overlay/*.go`
3. Aggiunge build tag desktop su `main.go` e `icon.go`
4. Esegue `strip_funcs.py` — rimuove da `game.go`: `openSceneDialog`, `saveScene`, `saveSceneAs`, `runSimToolbar`; da `editor.go`: `toggleEdit`
5. `goimports` su `game.go` e `editor.go` (import orfani dopo lo strip)
6. `go mod replace` → `stubs/native`
7. Compila `web/kutta.wasm` (~14 MB) e copia `wasm_exec.js`; opzionale `kutta.wasm.gz` (~3 MB)

**Non committare** `kutta.wasm`, `kutta.wasm.gz`, `wasm_exec.js` (in `.gitignore`). La CI li genera prima del deploy Pages (`.github/workflows/deploy.yml`).

## Avvio locale

```bash
git submodule update --init --recursive kutta-web/kutta
./kutta-web/scripts/build.sh
python3 -m http.server 8123   # dalla radice del repo
# http://localhost:8123/kutta-web/web/
```

Serve HTTP: il WASM non funziona con `file://`.

## Aggiornare kutta

```bash
cd kutta-web/kutta && git fetch && git checkout trunk && git pull
cd ../.. && ./kutta-web/scripts/build.sh
```

Dopo un bump del submodule verificare che `strip_funcs.py` rimuova ancora i metodi giusti se upstream li rinomina o sposta.

## File web

| File | Ruolo |
|---|---|
| `web/index.html` | Pagina didattica, iframe, legenda controlli IT |
| `web/game.html` | Carica `kutta.wasm` + `wasm_exec.js`, notifica parent via `postMessage` |
| `web/app.js` | Overlay caricamento, timeout errore |
| `web/style.css` | Tema scuro allineato a `cilindro-reynolds` |
| `index.html` | Redirect a `web/` |

Dimensioni iframe simulazione: **1380×756 px** (costanti `winW`/`winH` in kutta `game.go`).

## Convenzioni

- Interfaccia e commenti nuovi: **italiano**
- Non toccare altri progetti del monorepo
- Patch WASM solo in `overlay/` e `stubs/` — mai nel submodule `kutta/`
- Per nascondere o disabilitare UI desktop: override con build tag `js && wasm` + strip del metodo desktop corrispondente in `strip_funcs.py`
