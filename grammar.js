/**
 * @file Tree-sitter grammar for Age of Empires II random map scripts (.rms).
 * @author T-West <twestura@gmail.com>
 * @license GPL-3.0-or-later
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "aoe2_rms",

  // TODO use only ascii whitespace, check whether vertical tab and form feed count
  extras: ($) => [/[ \t\r\n]/],
  // extras: ($) => [/[ \t\r\n\v\f]/],

  rules: {
    source_file: ($) => repeat($._definition),
    _definition: ($) => choice($.define_statement, $.const_statement),
    define_statement: ($) => seq("#define", $.identifier),
    const_statement: ($) => seq("#const", $.identifier, $.integer),
    identifier: ($) => /\S+/,
    integer: ($) => /[0-9]+/,
  },
});
