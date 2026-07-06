#!/usr/bin/env python3
"""Rimuove metodi Game duplicati prima della build WASM (sostituiti da overlay/input_js.go)."""

import re
import sys


def strip_method(source: str, receiver: str, name: str) -> str:
    escaped_receiver = re.escape(receiver)
    pattern = rf"func \({escaped_receiver}\) {re.escape(name)}\([^)]*\)"
    match = re.search(pattern, source)
    if not match:
        return source

    start = match.start()
    # Salta il commento immediatamente precedente (se presente).
    line_start = source.rfind("\n", 0, start) + 1
    prev = source.rfind("\n\n", 0, line_start)
    if prev != -1:
        between = source[prev:line_start]
        if between.strip().startswith("//"):
            start = prev + 1

    brace = source.find("{", match.end())
    if brace == -1:
        return source

    depth = 0
    i = brace
    while i < len(source):
        ch = source[i]
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                end = i + 1
                while end < len(source) and source[end] in "\r\n":
                    end += 1
                return source[:start] + source[end:]
        i += 1
    return source


def main() -> None:
    if len(sys.argv) != 2:
        print("usage: strip_funcs.py <kutta-build-dir>", file=sys.stderr)
        sys.exit(1)

    root = sys.argv[1]
    game_path = f"{root}/game.go"
    editor_path = f"{root}/editor.go"

    with open(game_path, encoding="utf-8") as f:
        game = f.read()
    for name in ("openSceneDialog", "saveScene", "saveSceneAs", "runSimToolbar", "drawBottomPanel"):
        game = strip_method(game, "g *Game", name)
    with open(game_path, "w", encoding="utf-8") as f:
        f.write(game)

    with open(editor_path, encoding="utf-8") as f:
        editor = f.read()
    editor = strip_method(editor, "g *Game", "toggleEdit")
    with open(editor_path, "w", encoding="utf-8") as f:
        f.write(editor)


if __name__ == "__main__":
    main()
