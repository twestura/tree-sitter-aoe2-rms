# tree-sitter-aoe2-rms

A [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for [Age of Empires II](https://www.ageofempires.com/) [random map scripts](https://docs.google.com/document/d/1jnhZXoeL9mkRUJxcGlKnO98fIwFKStP_OBozpr0CHXo) (`.rms`).

## Usage

This grammar can be used by any editor with Tree-sitter support, such as Emacs, Neovim, and Zed.

For the Zed extension see [zed-aoe2-rms](https://github.com/twestura/zed-aoe2-rms).

## Development

Run `tree-sitter init-config` to generate a configuration file.
In that file, ensure the `"parser-directories"` field includes the path to this repository's parent folder.
For example, if the repository is cloned to `C:\Users\twest\Desktop\aoe2-rms-extensions\tree-sitter-aoe2-rms`, the `config.json` file should contain:

```json
{
  "parser-directories": ["C:\\Users\\twest\\Desktop\\aoe2-rms-extensions"]
}
```

Run `tree-sitter generate` to build the parser.

The `examples` folder contains sample `.rms` files that can be highlighted using `tree-sitter highlight examples/path-to-file.rms`.

The `test/highlight` folder contains test files that can be run using `tree-sitter test`.
