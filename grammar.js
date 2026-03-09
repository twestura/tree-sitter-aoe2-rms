/**
 * @file Tree-sitter grammar for Age of Empires II random map scripts (.rms).
 * @author T-West <twestura@gmail.com>
 * @license GPL-3.0-or-later
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

// The grammar currently always highlights `base_terrain` and `base_layer` as
// attributes. They are the names of both commands and of attributes and are
// ambiguous without context.

// Note the grammar is limited in it's current highlighting of comments that
// it incorrectly treats as comments sequences such as /*text*/ that do not
// separate the /* and */ sequences by whitespace. And it does not support
// nested comments.
//
// RMS supports nested comments. The comment rule is inspired by the
// specification of block comments in Rust:
// https://doc.rust-lang.org/reference/comments.html
//
// comment: ($) =>
//   choice(
//     seq(
//       token("/*"),
//       choice(/[^*]/, "**", $.comment),
//       repeat(choice($.comment, /[^*]/, /\*[^/]/)),
//       token("*/"),
//     ),
//     "/**/",
//     "/***/",
//   ),
// However, this rule seems not to work in Rust. And it appears that
// nested comments may require writing a bit of C code to support.

/// The names of RMS keywords for if statements and random blocks.
const CONTROL_FLOW_KEYWORDS = [
  "if",
  "elseif",
  "else",
  "endif",
  "start_random",
  "percent_chance",
  "end_random",
];

/// The names of the seven RMS sections, including the angle brackets.
const SECTION_NAMES = [
  "<PLAYER_SETUP>",
  "<LAND_GENERATION>",
  "<ELEVATION_GENERATION>",
  "<CLIFF_GENERATION>",
  "<TERRAIN_GENERATION>",
  "<CONNECTION_GENERATION>",
  "<OBJECTS_GENERATION>",
];

/** The names of RMS commands, not including `base_terrain` or `base_layer. */
const COMMAND_NAMES = [
  "random_placement",
  "direct_placement",
  "grouped_by_team",
  "nomad_resources",
  "force_nomad_treaty",
  "behavior_version",
  "override_map_size",
  "set_gaia_civilization",
  "ai_info_map_type",
  "effect_amount",
  "effect_percent",
  "guard_state",
  "terrain_state",
  "weather_type",
  "water_definition",
  "enable_waves",
  "create_player_lands",
  "create_land",
  "create_elevation",
  "color_correction",
  "create_terrain",
  "cliff_type",
  "min_number_of_cliffs",
  "max_number_of_cliffs",
  "min_length_of_cliff",
  "max_length_of_cliff",
  "cliff_curliness",
  "min_distance_cliffs",
  "min_terrain_distance",
  "accumulate_connections",
  "create_connect_all_players_land",
  "create_connect_teams_lands",
  "create_connect_all_lands",
  "create_connect_same_land_zones",
  "create_connect_land_zones",
  "create_connect_to_nonplayer_land",
  "create_actor_area",
  "create_object_group",
  "create_object",
];

/// The names of RMS attributes, not including `base_terrain` or `base_layer`.
const ATTRIBUTE_NAMES = [
  "terrain_type",
  "land_percent",
  "number_of_tiles",
  "base_size",
  "set_circular_base",
  "generate_mode",
  "land_position",
  "circle_radius",
  "left_border",
  "right_border",
  "top_border",
  "bottom_border",
  "border_fuzziness",
  "clumping_factor",
  "land_conformity",
  "base_elevation",
  "assign_to_player",
  "assign_to",
  "zone",
  "set_zone_by_team",
  "set_zone_randomly",
  "other_zone_avoidance_distance",
  "min_placement_distance",
  "land_id",
  "number_of_clumps",
  "set_scale_by_size",
  "set_scale_by_groups",
  "spacing",
  "enable_balanced_elevation",
  "beach_terrain",
  "terrain_mask",
  "spacing_to_other_terrain_types",
  "spacing_to_specific_terrain",
  "set_flat_terrain_only",
  "set_avoid_player_start_areas",
  "height_limits",
  "default_terrain_replacement",
  "replace_terrain",
  "terrain_cost",
  "terrain_size",
  "add_object",
  "number_of_objects",
  "number_of_groups",
  "group_variance",
  "group_placement_radius",
  "set_tight_grouping",
  "set_loose_grouping",
  "min_connected_tiles",
  "resource_delta",
  "second_object",
  "set_scaling_to_map_size",
  "set_scaling_to_player_number",
  "set_place_for_every_player",
  "place_on_specific_land_id",
  "avoid_other_land_zones",
  "generate_for_first_land_only",
  "set_gaia_object_only",
  "set_gaia_unconvertible",
  "set_building_capturable",
  "make_indestructible",
  "min_distance_to_players",
  "max_distance_to_players",
  "set_circular_placement",
  "terrain_to_place_on",
  "layer_to_place_on",
  "ignore_terrain_restrictions",
  "max_distance_to_other_zones",
  "place_on_forest_zone",
  "avoid_forest_zone",
  "avoid_cliff_zone",
  "min_distance_to_map_edge",
  "min_distance_group_placement",
  "temp_min_distance_group_placement",
  "find_closest",
  "find_closest_to_map_center",
  "find_closest_to_map_edge",
  "enable_tile_shuffling",
  "require_path",
  "force_placement",
  "actor_area",
  "actor_area_radius",
  "override_actor_radius_if_required",
  "actor_area_to_place_in",
  "avoid_actor_area",
  "avoid_all_actor_areas",
  "set_facet",
  "match_player_civ",
];

/** Operators that may appear in math expressions. */
const OPERATORS = ["+", "-", "*", "/", "%"];

export default grammar({
  name: "aoe2_rms",
  externals: ($) => [
    "{",
    "}",
    $.base_terrain_command,
    $.base_terrain_attribute,
    $.base_layer_command,
    $.base_layer_attribute,
    $._error_sentinel,
  ],
  extras: ($) => [/\s/, $.comment],
  rules: {
    source_file: ($) =>
      repeat(
        choice(
          $.section_name,
          $.keyword_control,
          $.command_name,
          $.attribute_name,
          $.base_terrain_command,
          $.base_terrain_attribute,
          $.base_layer_command,
          $.base_layer_attribute,
          "#const",
          "#define",
          seq("#include_drs", $.filepath),
          seq("#includeXS", $.filepath),
          "{",
          "}",
          "(",
          ")",
          seq("rnd", "(", $.integer, ",", $.integer, ")"),
          $.integer,
          $.float,
          $.operator,
          $.identifier,
        ),
      ),

    keyword_control: ($) => choice(...CONTROL_FLOW_KEYWORDS),
    section_name: ($) => choice(...SECTION_NAMES),
    command_name: ($) => choice(...COMMAND_NAMES),
    attribute_name: ($) => choice(...ATTRIBUTE_NAMES),
    operator: ($) => choice(...OPERATORS),

    integer: ($) => /[+-]?[0-9]+/,
    float: ($) => /[+-]?(inf|[0-9]*\.[0-9]+)/,
    identifier: ($) => /[\p{L}\p{N}_#$\-]+/u,

    filepath: ($) => choice($.string, $.filename),
    string: ($) => seq('"', repeat(choice($.escape, /[^"\\]/)), '"'),
    escape: ($) => /\\\S/,
    filename: ($) => /[^"\s]\S*/,

    comment: ($) => token(seq("/*", /[^*]*\*+([^/*][^*]*\*+)*/, "/")),
  },
});
