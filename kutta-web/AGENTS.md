# AGENTS.md — kutta-web

Progetto del monorepo `fluido-data-viz` (vedi `AGENTS.md` alla radice). **Eccezione alle regole standard:** richiede Go, submodule git e build WASM.

## Cos'è

Simulazione didattica del tunnel del vento 2D [kutta](https://github.com/crgimenes/kutta) nel browser. Il solver LBM (`kutta/lbm`), la geometria NACA (`kutta/foil`) e la visualizzazione (`kutta/viz`) girano in WASM via Ebitengine.

## Stack

- **Submodule:** `kutta/` → `https://github.com/crgimenes/kutta` (branch `trunk`)
- **Build:** `scripts/build.sh` compila con `GOOS=js GOARCH=wasm` in una directory temporanea
- **Web:** `web/index.html` (shell italiana) + `web/game.html` (loader WASM in iframe)

Non modificare file dentro `kutta/` nel submodule: usa `overlay/` e `stubs/`.

## Build WASM

```bash
./kutta-web/scripts/build.sh
```

Lo script:
1. Copia `kutta/` in temp
2. Applica `overlay/*.go` e build tag desktop su `main.go`/`icon.go`
3. Rimuove metodi duplicati (`openSceneDialog`, `saveScene`, `saveSceneAs`, `toggleEdit`) via `scripts/strip_funcs.py`
4. `go mod replace` → `stubs/native` per filedialog no-op
5. Output in `web/kutta.wasm` + `web/wasm_exec.js`

## Avvio locale

```bash
python3 -m http.server 8123   # dalla radice del repo
# http://localhost:8123/kutta-web/web/
```

## Aggiornare kutta

```bash
cd kutta-web/kutta && git fetch && git checkout trunk && git pull
cd ../.. && ./kutta-web/scripts/build.sh
```

Verificare che `strip_funcs.py` rimuova ancora i metodi giusti se upstream rinomina funzioni.

## File web

| File | Ruolo |
|---|---|
| `web/index.html` | Pagina didattica, iframe, legenda controlli IT |
| `web/game.html` | Carica `kutta.wasm` + `wasm_exec.js` |
| `web/app.js` | Overlay caricamento, messaggi errore via `postMessage` |
| `web/style.css` | Tema scuro allineato a `cilindro-reynolds` |

Dimensioni finestra simulazione: 1380×756 px (costanti `winW`/`winH` in kutta `game.go`).

## Convenzioni

- Interfaccia e commenti nuovi: **italiano**
- Non toccare altri progetti del monorepo
- `kutta.wasm` è in `.gitignore`; CI lo genera prima del deploy Pages
