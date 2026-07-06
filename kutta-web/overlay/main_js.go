//go:build js && wasm

// Entry point Ebitengine per il browser: niente icona finestra né ridimensionamento nativo.
package main

import (
	"log"

	"github.com/hajimehoshi/ebiten/v2"
)

func main() {
	ebiten.SetWindowSize(winW, winH)
	ebiten.SetWindowTitle("kutta — 2D wind tunnel")
	err := ebiten.RunGame(NewGame())
	if err != nil {
		log.Fatal(err)
	}
}
