# fluido-data-viz

Raccolta di visualizzazioni interattive didattiche di fluidodinamica. Ogni progetto vive in una propria sottocartella, autonoma e senza dipendenze (HTML/CSS/JS puro).

## Progetti

| Cartella | Descrizione |
|---|---|
| [`cilindro-reynolds/`](cilindro-reynolds/) | Flusso esterno attorno a un cilindro circolare al variare del numero di Reynolds (10⁰–10⁷), con fluido selezionabile, simulazione a particelle, grafico C_d(Re) e regimi di scia |
| [`kutta-web/`](kutta-web/) | Tunnel del vento 2D attorno a profili NACA (simulazione LBM kutta nel browser via WASM): campi, fumo, portanza/resistenza, angolo d'attacco |

## Avvio

Ogni progetto si avvia allo stesso modo, servendo la radice del repo:

```bash
python3 -m http.server 8123
# poi apri http://localhost:8123 e scegli il progetto
```

Oppure apri direttamente l'`index.html` del progetto nel browser.

## Aggiungere un nuovo progetto

1. Crea una nuova sottocartella con un nome descrittivo (kebab-case).
2. Metti dentro `index.html`, `style.css`, `app.js`, un `README.md` e un `AGENTS.md` specifici del progetto.
3. Aggiungi la riga corrispondente alla tabella qui sopra e un link nella pagina indice (`index.html` alla radice).
