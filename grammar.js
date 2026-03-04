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
  extras: ($) => [/[ \t\r\n]/, $.comment],
  // extras: ($) => [/[ \t\r\n\v\f, $.comment]/],

  // Note the grammar is limited in it's current highlighting of comments that
  // it incorrectly treats as comments sequences such as /*text*/ that do not
  // separate the /* and */ sequences by whitespace.
  //
  // RMS supports nested comments. The comment rule is inspired by the
  // specification of block comments in Rust:
  // https://doc.rust-lang.org/reference/comments.html

  rules: {
    source_file: ($) => repeat($._definition),
    _definition: ($) => choice($.define_statement, $.const_statement),
    define_statement: ($) => seq("#define", $.identifier),
    const_statement: ($) => seq("#const", $.identifier, $.integer),
    identifier: ($) => /\S+/,
    integer: ($) => /[0-9]+/,
    comment: ($) =>
      choice(
        seq(
          "/*",
          choice(/[^*]/, "**", $.comment),
          repeat(choice($.comment, /[^*]/, /\*[^/]/)),
          "*/",
        ),
        "/**/",
        "/***/",
      ),
  },
});
