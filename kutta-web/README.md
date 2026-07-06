# kutta-web — tunnel del vento 2D nel browser

Porta [kutta](https://github.com/crgimenes/kutta) nel browser tramite **Go → WebAssembly** e **Ebitengine**. Mostra il flusso LBM attorno a profili NACA con fumo, campi scalari e vettori di portanza/resistenza.

**Scope:** solo modalità simulatore (niente editor né salvataggio scene nel browser).

## Requisiti

- **Go ≥ 1.26** (come richiesto da kutta)
- Server HTTP per servire i file (il WASM non funziona con `file://`)

## Prima esecuzione

```bash
# dalla radice del monorepo
git submodule update --init --recursive kutta-web/kutta
./kutta-web/scripts/build.sh
python3 -m http.server 8123
# apri http://localhost:8123/kutta-web/web/
```

La build produce `kutta-web/web/kutta.wasm` (~15–25 MB) e copia `wasm_exec.js`.

## Struttura

| Percorso | Contenuto |
|---|---|
| `kutta/` | Submodule → [crgimenes/kutta](https://github.com/crgimenes/kutta) (branch `trunk`) |
| `overlay/` | Patch Go con build tag WASM (entry point, stub editor/file) |
| `stubs/native/` | Sostituto no-op di `filedialog` per il browser |
| `scripts/build.sh` | Compila WASM in directory temporanea (non modifica il submodule) |
| `web/` | Shell HTML italiana + artefatti WASM |

## Controlli

Vedi la legenda in `web/index.html`. In sintesi: ↑/↓ angolo d'attacco, Tab profilo NACA, V campo, S streamline, G bloom, `[` `]` velocità, Spazio pausa, R reset.

## Limitazioni

- Simulazione **qualitativa**, non CFD validata (come kutta desktop).
- Primo caricamento lento per la dimensione del binario WASM.
- Editor (`E`), apertura (`O`) e salvataggio scene disabilitati nel browser.

## Licenza

Il codice di integrazione è parte di fluido-data-viz. kutta è [MIT](https://github.com/crgimenes/kutta/blob/trunk/LICENSE).
