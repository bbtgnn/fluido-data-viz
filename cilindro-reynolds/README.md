# Fluido Data Viz — Variazione del flusso con Re

Visualizzazione interattiva del flusso attorno a un cilindro circolare al variare del **numero di Reynolds**.

## Contesto

- **Fluido variabile** (default: aria a 20 °C; disponibili anche acqua, olio d'oliva, glicerina)
- **Re variabile** da 10⁰ a 10⁷ (valore iniziale: 10⁵)
- Simulazione a particelle del campo di moto: flusso potenziale + modelli di scia (ricircolo stazionario, scia di von Kármán, turbolenza, crisi della resistenza)

## Funzionalità

- Slider logaritmico per Re e per il diametro del cilindro
- Selettore del fluido (ρ e μ reali)
- Riquadro con grandezze fisiche derivate: viscosità cinematica, velocità U∞, C_d, resistenza per metro, frequenza di distacco dei vortici (Strouhal)
- Grafico C_d(Re) con indicatore della condizione corrente
- Descrizione del regime di flusso attivo

## Avvio

Nessuna dipendenza: è HTML/CSS/JS puro.

```bash
# dalla radice del repo
python3 -m http.server 8123
# poi apri http://localhost:8123/cilindro-reynolds/
```

Oppure apri direttamente `index.html` nel browser.
