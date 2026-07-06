// Package filedialog fornisce stub no-op per build WASM (nessun dialogo nativo nel browser).
package filedialog

// Options descrive un dialogo di apertura o salvataggio file.
type Options struct {
	Title      string
	Extensions []string
	Filename   string
}

// Open restituisce sempre stringa vuota: annullato / non supportato su WASM.
func Open(Options) string { return "" }

// Save restituisce sempre stringa vuota: annullato / non supportato su WASM.
func Save(Options) string { return "" }
