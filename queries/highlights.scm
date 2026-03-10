; Highlights for Age of Empires II random map scripts.

(comment) @comment

[
  "if"
  "elseif"
  "else"
  "endif"
  "start_random"
  "percent_chance"
  "end_random"
] @keyword.control
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
