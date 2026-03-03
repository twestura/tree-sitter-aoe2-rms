/**
 * @file Tree-sitter grammar for Age of Empires II random map scripts (.rms).
 * @author T-West <twestura@gmail.com>
 * @license GPL-3.0-or-later
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "aoe2_rms",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => "hello"
  }
});
