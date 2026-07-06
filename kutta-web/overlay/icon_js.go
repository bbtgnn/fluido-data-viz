//go:build js && wasm

package main

// setWindowIcon è un no-op nel browser (nessuna icona finestra).
func setWindowIcon() {}
