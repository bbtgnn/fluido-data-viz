//go:build js && wasm

package main

import (
	"github.com/hajimehoshi/ebiten/v2"
	"github.com/hajimehoshi/ebiten/v2/vector"
)

// drawBottomPanel — pannello controlli senza editor né I/O scene (scope browser).
func (g *Game) drawBottomPanel(screen *ebiten.Image) {
	top := float64(simH)
	vector.StrokeLine(screen, 0, float32(top), winW, float32(top), 1, colSep, false)

	x := 16.0
	y := g.header(screen, "CONTROLS", x, top+14)
	controls := [][2]string{
		{"Up / Down", "angle of attack"},
		{"Tab", "cycle profile"},
		{"V", "speed/vort/press"},
		{"S", "streamlines"},
		{"G", "glow / bloom"},
		{"[  ]", "inlet speed"},
		{"Space", "pause / resume"},
		{"N", "step (paused)"},
		{"R", "reset the flow"},
	}
	const colW = 250.0
	const rows = 7
	for i, c := range controls {
		cx := x + float64(i/rows)*colW
		cy := y + float64(i%rows)*16
		drawString(screen, c[0], cx, cy, colValue)
		drawString(screen, c[1], cx+86, cy, colLabel)
	}

	g.drawClPlot(screen, 540, top+24, 480, 116)
}
