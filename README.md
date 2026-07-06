# fluido-data-viz

Raccolta di visualizzazioni interattive didattiche di fluidodinamica. Ogni progetto vive in una propria sottocartella, autonoma e senza dipendenze (HTML/CSS/JS puro).

## Progetti

| Cartella | Descrizione |
|---|---|
| [`cilindro-reynolds/`](cilindro-reynolds/) | Flusso attorno a un cilindro — Re 10⁰–10⁷, fluido selezionabile, particelle, C_d(Re), regimi di scia |
| [`kutta-web/web/`](kutta-web/web/) | Profili NACA nel tunnel del vento — LBM kutta (WASM): campi, fumo, portanza/resistenza, angolo d'attacco |

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
