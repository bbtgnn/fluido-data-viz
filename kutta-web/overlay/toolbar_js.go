//go:build js && wasm

package main

import ui "github.com/crgimenes/minigui"

// runSimToolbar — toolbar simulatore per il browser (senza editor né file).
func (g *Game) runSimToolbar() {
	g.gui.Begin(ui.InputFromEbiten(), 8, 8)
	if g.gui.Button("st.field", fieldName(g.mode)) {
		g.mode = (g.mode + 1) % modeCount
	}
	g.gui.SameLine()
	if g.gui.Toggle("st.pause", "Pause", g.paused) {
		g.paused = !g.paused
	}
	if g.scn == nil {
		g.gui.SameLine()
		g.gui.Label("NACA")
		g.gui.SameLine()
		g.gui.SetItemWidth(60)
		g.gui.TextField("st.naca", &g.nacaInput)
		if g.gui.Submitted("st.naca") {
			g.setNACA(g.nacaInput)
		}
	}
	g.gui.End()
}
