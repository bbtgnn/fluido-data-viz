// Package clipboard fornisce stub no-op per build WASM.
package clipboard

import "errors"

// ErrUnsupported indica che gli appunti non sono disponibili su questa piattaforma.
var ErrUnsupported = errors.New("clipboard: not supported on this platform")

// ReadText restituisce sempre stringa vuota su WASM.
func ReadText() (string, error) { return "", ErrUnsupported }

// WriteText è un no-op su WASM.
func WriteText(string) error { return ErrUnsupported }
