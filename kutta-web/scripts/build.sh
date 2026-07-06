#!/usr/bin/env bash
# Compila kutta per WASM e copia gli artefatti in kutta-web/web/.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
REPO_ROOT="$(cd "$ROOT/.." && pwd)"
KUTTA_SRC="$ROOT/kutta"
OVERLAY="$ROOT/overlay"
WEB_OUT="$ROOT/web"
STRIP="$ROOT/scripts/strip_funcs.py"

echo "==> kutta-web: preparazione submodule"
cd "$REPO_ROOT"
git submodule update --init --recursive kutta-web/kutta

if ! command -v go >/dev/null 2>&1; then
  echo "Errore: Go non trovato. Serve Go >= 1.26 (vedi kutta-web/README.md)." >&2
  exit 1
fi

BUILD_DIR="$(mktemp -d)"
trap 'rm -rf "$BUILD_DIR"' EXIT

echo "==> kutta-web: copia sorgenti in $BUILD_DIR"
cp -R "$KUTTA_SRC/." "$BUILD_DIR/"
cp "$OVERLAY"/*.go "$BUILD_DIR/"

add_desktop_tag() {
  local file="$1"
  if head -1 "$file" | grep -q '^//go:build'; then
    return
  fi
  {
    echo '//go:build !(js && wasm)'
    echo
    cat "$file"
  } >"$file.tmp" && mv "$file.tmp" "$file"
}

add_desktop_tag "$BUILD_DIR/main.go"
add_desktop_tag "$BUILD_DIR/icon.go"

python3 "$STRIP" "$BUILD_DIR"

echo "==> kutta-web: pulizia import"
(
  cd "$BUILD_DIR"
  go run golang.org/x/tools/cmd/goimports@latest -w game.go editor.go
)

echo "==> kutta-web: replace filedialog stub"
(
  cd "$BUILD_DIR"
  go mod edit -replace=github.com/crgimenes/native="$ROOT/stubs/native"
)

mkdir -p "$WEB_OUT"

echo "==> kutta-web: compilazione WASM (può richiedere alcuni minuti)"
(
  cd "$BUILD_DIR"
  env GOOS=js GOARCH=wasm go build -ldflags="-s -w" -o "$WEB_OUT/kutta.wasm" .
)

GOROOT="$(go env GOROOT)"
WASM_EXEC="$GOROOT/lib/wasm/wasm_exec.js"
if [[ ! -f "$WASM_EXEC" ]]; then
  WASM_EXEC="$GOROOT/misc/wasm/wasm_exec.js"
fi
if [[ ! -f "$WASM_EXEC" ]]; then
  echo "Errore: wasm_exec.js non trovato in GOROOT ($GOROOT)." >&2
  exit 1
fi
cp "$WASM_EXEC" "$WEB_OUT/wasm_exec.js"

if command -v gzip >/dev/null 2>&1; then
  gzip -kf "$WEB_OUT/kutta.wasm"
  echo "==> kutta-web: creato kutta.wasm.gz ($(du -h "$WEB_OUT/kutta.wasm.gz" | cut -f1))"
fi

echo "==> kutta-web: build completata → $WEB_OUT/kutta.wasm ($(du -h "$WEB_OUT/kutta.wasm" | cut -f1))"
