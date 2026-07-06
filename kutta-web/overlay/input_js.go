//go:build js && wasm

package main

// openSceneDialog è disabilitato nel browser (nessun filesystem locale).
func (g *Game) openSceneDialog() {}

// saveScene è disabilitato nel browser.
func (g *Game) saveScene() {}

// saveSceneAs è disabilitato nel browser.
func (g *Game) saveSceneAs() {}

// toggleEdit è disabilitato: scope sim-only nel browser.
func (g *Game) toggleEdit() {}
