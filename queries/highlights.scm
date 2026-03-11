; Highlights for Age of Empires II random map scripts.

(comment) @comment

(keyword_control) @keyword.control
(section_name) @tag
(command_name) @function
(attribute_name) @property

"base_terrain" @function
(block "base_terrain" @property)
"base_layer" @function
(block "base_layer" @property)

"rnd" @function

[
  "#const"
  "#define"
  "#include_drs"
  "#includeXS"
] @keyword

[
  "{"
  "}"
  "("
  ")"
] @punctuation.bracket

"," @punctuation.delimiter

(operator) @operator
(identifier) @constant
(integer) @number
(float) @number
(filepath) @string
(escape) @string.escape
(macro) @preproc
