# tree-sitter-aoe2-rms

A [Tree-sitter](https://tree-sitter.github.io/tree-sitter/) grammar for [Age of Empires II](https://www.ageofempires.com/) [random map scripts](https://docs.google.com/document/d/1jnhZXoeL9mkRUJxcGlKnO98fIwFKStP_OBozpr0CHXo) (`.rms`).

## Usage

This grammar can be used by any editor with Tree-sitter support, such as Emacs, Neovim, and Zed.

For the Zed extension see [zed-aoe2-rms](https://github.com/twestura/zed-aoe2-rms).

## Quirks

The RMS syntax has a few weird corner cases that are awkward or ambiguous to highlight.
Most map scripts do not contain these cases, but it is possible to construct pathological scripts that abuse the syntax.

### Int Values as Tokens

Every token is represented by an integer value.
If RMS constants are defined, they can, in several cases, be used in place of the corresponding token.
For example, the `/*` and `*/` tokens that begin and end comments are represented by `69` and `70`, respectively.
The `random.def` file included in all map scripts defines `SHORE_FISH` as `69` and `HOUSE` as `70`.
The following are both valid ways to write a comment:

```text
/* This line is a comment. */
SHORE_FISH This line also is a comment. HOUSE
```

This grammar does not attempt to examine the value of constants.
It only recognizes the `/*` and `*/` tokens for comments.
And the second line, perhaps inappropriately, is not matched by the grammar's comment checker.

### Whitespace

Everything that is not ascii whitespace is a valid character for an identifier.
Identifiers may start with integers, may be emoji, and may even contain unicode whitespace characters such as the zero-width space.
This grammar handles many unicode characters as part of identifiers, but is not as general as the RMS parser.

It is, however, important to separate syntax using whitespace.
As identifiers consist of all nonwhitespace characters, a sequence of characters such as

```text
a/*b*/c
```

is an identifier.
There is no comment included inside of it.
Similarly, whitespace must be used around curly braces.

```text
{ set_place_for_every_player }
{set_place_for_every_player}
```

The first line consists of an opening brace, an attribute name, and a closing brace.
The second line consists of a single identifier.

### Multiple Meanings

The `base_terrain` and `base_layer` tokens are used both as command names in the land generation section and as attribute names in various commands.
The heuristic that the grammar uses is to treat them as commands when they are not included in a block, and as attribute names when they are, where a block is defined by a `{` and `}` pair.

However, this heuristic may be incorrect in some cases.
In particular, it is possible for one of these tokens to be used as both a command and an attribute name in the same context.

```text
<LAND_GENERATION>
if A
  base_terrain GRASS
  create_player_lands {
    terrain_type DIRT
    number_of_tiles 0
  }
  <TERRAIN_GENERATION>
  create_terrain WATER {
  endif
    base_terrain GRASS
  if A
  else
    create_player_lands {
      terrain_type DESERT
      number_of_tiles 0
  endif
}
```

In this example, the second occurrence of `base_terrain`, depending on whether `A` is defined, is either a command name in the land generation section or an attribute name within the `create_terrain` block.
In this case, the grammar still uses the block heuristic to parse this `base_terrain` occurrence as an attribute name.

Further, code may be written that sometimes is a comment and sometimes is not (and writing code in this fashion is a control flow technique that allows code to be executed conditionally in ways beyond what is possible with RMS if statements).
For example, in the following code, when `X` is `70`, it is the same integer value as the `*/` token that ends a comment.
In that case, the rest of the line is not treated as a comment.
The spurious `*/` at the end simply is ignored.

```text
start_random
  percent_chance 50 #const X 0
  percent_chance 50 #const X 70
end_random

<OBJECTS_GENERATION>
/* X create_object ARCHER { number_of_objects 100 } */
```

The grammar in this case parses the entire line as a comment, even though whether the line is or is not a comment is random and determined dynamically when the map is generated.

### Multiple Braces

It is possible for braces to be used in ways such that starting and ending braces are not matched one-to-one.
Consider the following example:

```text
<OBJECTS_GENERATION>
if A
  create_object ARCHER {
else
  create_object SCOUT {
endif
  number_of_objects 100
}
```

Here two opening braces match the single closing brace.
The grammar will parse a single block in this case, matching the second opening bracket with the closing bracket.

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

## Preprocessor Highlighting

This grammar supports an experimental feature that highlights strings that begin with `#` as preprocessor directives (except for keywords such as `#define`).
This is not part of the standard RMS syntax, and they really should be highlighted as identifiers.

The preprocessor highlighting is a hack I use for tools that interact with my own map scripts, and I may change it at any time.
