/**
 * @file Tree-sitter grammar for Age of Empires II random map scripts (.rms).
 * @author T-West <twestura@gmail.com>
 * @license GPL-3.0-or-later
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "aoe2_rms",

  // TODO check whether vertical tabs and form feeds count as whitespace
  // Also apply the same change to the identifier
  extras: ($) => [
    /[ \t\r\n]/,
    $.comment,
    $.if_directive,
    $.elseif_directive,
    $.else_directive,
    $.endif_directive,
    $.start_random_directive,
    $.percent_chance_directive,
    $.end_random_directive,
  ],

  // Note the grammar is limited in it's current highlighting of comments that
  // it incorrectly treats as comments sequences such as /*text*/ that do not
  // separate the /* and */ sequences by whitespace.
  //
  // RMS supports nested comments. The comment rule is inspired by the
  // specification of block comments in Rust:
  // https://doc.rust-lang.org/reference/comments.html

  rules: {
    source_file: ($) => seq(repeat($._global_statement), repeat($.section)),
    section: ($) =>
      choice(
        $.player_setup,
        $.land_generation,
        $.elevation_generation,
        $.cliff_generation,
        $.terrain_generation,
        $.connection_generation,
        $.objects_generation,
      ),

    player_setup: ($) =>
      seq(
        "<PLAYER_SETUP>",
        repeat(choice($.player_setup_command, $._global_statement)),
      ),
    player_setup_command: ($) =>
      choice(
        "random_placement",
        "direct_placement",
        "grouped_by_team",
        "nomad_resources",
        "force_nomad_treaty",
        seq("behavior_version", $._arg),
        seq("override_map_size", $._arg),
        seq("set_gaia_civilization", $._arg),
        seq("ai_info_map_type", $._arg, $._arg, $._arg, $._arg),
        seq("effect_amount", $._arg, $._arg, $._arg, $._arg),
        seq("effect_percent", $._arg, $._arg, $._arg, $._arg),
        seq("guard_state", $._arg, $._arg, $._arg, $._arg),
        seq("terrain_state", $._arg, $._arg, $._arg, $._arg),
        seq("weather_type", $._arg, $._arg, $._arg, $._arg),
        seq("water_definition", $._arg),
      ),

    land_generation: ($) =>
      seq(
        "<LAND_GENERATION>",
        repeat(choice($.land_generation_command, $._global_statement)),
      ),
    land_generation_command: ($) =>
      choice(
        seq("base_terrain", $._arg),
        seq("base_layer", $._arg),
        seq("enable_waves", $._arg),
        seq(
          choice("create_player_lands", "create_land", $.identifier),
          "{",
          repeat($.create_land_attribute),
          "}",
        ),
      ),
    create_land_attribute: ($) =>
      choice(
        seq("terrain_type", $._arg),
        seq("land_percent", $._arg),
        seq("number_of_tiles", $._arg),
        seq("base_size", $._arg),
        "set_circular_base",
        seq("generate_mode", $._arg),
        seq("land_position", $._arg, $._arg),
        seq("circle_radius", $._arg, optional($._arg)),
        seq("left_border", $._arg),
        seq("right_border", $._arg),
        seq("top_border", $._arg),
        seq("bottom_border", $._arg),
        seq("border_fuzziness", $._arg),
        seq("clumping_factor", $._arg),
        seq("land_conformity", $._arg),
        seq("base_elevation", $._arg),
        seq("assign_to_player", $._arg),
        seq("assign_to", $._arg, $._arg, $._arg, $._arg),
        seq("zone", $._arg),
        "set_zone_by_team",
        "set_zone_randomly",
        seq("other_zone_avoidance_distance", $._arg),
        seq("min_placement_distance", $._arg),
        seq("land_id", $._arg),
      ),

    elevation_generation: ($) =>
      seq(
        "<ELEVATION_GENERATION>",
        repeat(choice($.elevation_generation_command, $._global_statement)),
      ),
    elevation_generation_command: ($) =>
      seq(
        "create_elevation",
        $._arg,
        "{",
        repeat($.create_elevation_attribute),
        "}",
      ),
    create_elevation_attribute: ($) =>
      choice(
        seq("base_terrain", $._arg),
        seq("base_layer", $._arg),
        seq("number_of_tiles", $._arg),
        seq("number_of_clumps", $._arg),
        "set_scale_by_size",
        "set_scale_by_groups",
        seq("spacing", $._arg),
        "enable_balanced_elevation",
      ),

    cliff_generation: ($) =>
      seq(
        "<CLIFF_GENERATION>",
        repeat(choice($.cliff_generation_command, $._global_statement)),
      ),
    cliff_generation_command: ($) =>
      choice(
        seq("cliff_type", $._arg),
        seq("min_number_of_cliffs", $._arg),
        seq("max_number_of_cliffs", $._arg),
        seq("min_length_of_cliff", $._arg),
        seq("max_length_of_cliff", $._arg),
        seq("cliff_curliness", $._arg),
        seq("min_distance_cliffs", $._arg),
        seq("min_terrain_distance", $._arg),
      ),

    terrain_generation: ($) =>
      seq(
        "<TERRAIN_GENERATION>",
        repeat(choice($.terrain_generation_command, $._global_statement)),
      ),
    terrain_generation_command: ($) =>
      choice(
        seq("color_correction", $._arg),
        seq(
          "create_terrain",
          $._arg,
          "{",
          repeat($.create_terrain_attribute),
          "}",
        ),
      ),
    create_terrain_attribute: ($) =>
      choice(
        seq("base_terrain", $._arg),
        seq("base_layer", $._arg),
        seq("beach_terrain", $._arg),
        seq("terrain_mask", $._arg),
        seq("spacing_to_other_terrain_types", $._arg),
        seq("spacing_to_specific_terrain", $._arg, $._arg),
        seq("set_flat_terrain_only", $._arg),
        seq("land_percent", $._arg),
        seq("number_of_tiles", $._arg),
        seq("number_of_clumps", $._arg),
        seq("clumping_factor", $._arg),
        seq("set_scale_by_size", $._arg),
        "set_scale_by_groups",
        seq("set_avoid_player_start_areas", optional($._arg)),
        seq("height_limits", $._arg, $._arg),
      ),

    connection_generation: ($) =>
      seq(
        "<CONNECTION_GENERATION>",
        repeat(choice($.connection_generation_command, $._global_statement)),
      ),
    connection_generation_command: ($) =>
      choice(
        "accumulate_connections",
        seq(
          choice(
            "create_connect_all_players_land",
            "create_connect_teams_lands",
            "create_connect_all_lands",
            "create_connect_same_land_zones",
            "create_connect_land_zones",
            "create_connect_to_nonplayer_land",
          ),
          "{",
          repeat($.create_connect_attribute),
          "}",
        ),
      ),
    create_connect_attribute: ($) =>
      choice(
        seq("default_terrain_replacement", $._arg),
        seq("replace_terrain", $._arg, $._arg),
        seq("terrain_cost", $._arg, $._arg),
        seq("terrain_size", $._arg, $._arg, $._arg),
      ),

    objects_generation: ($) =>
      seq(
        "<OBJECTS_GENERATION>",
        repeat(choice($.objects_generation_command, $._global_statement)),
      ),
    objects_generation_command: ($) =>
      choice(
        seq("create_actor_area", $._arg, $._arg, $._arg, $._arg),
        seq(
          "create_object_group",
          $.identifier,
          "{",
          repeat(seq("add_object", $._arg, $._arg)),
          "}",
        ),
        seq(
          "create_object",
          $.identifier,
          "{",
          repeat($.create_object_attribute),
          "}",
        ),
      ),
    create_object_attribute: ($) =>
      choice(
        seq("number_of_objects", $._arg),
        seq("number_of_groups", $._arg),
        seq("group_variance", $._arg),
        "group_placement_radius",
        "set_tight_grouping",
        "set_loose_grouping",
        seq("min_connected_tiles", $._arg),
        seq("resource_delta", $._arg),
        seq("second_object", $._arg),
        "set_scaling_to_map_size",
        "set_scaling_to_player_number",
        "set_place_for_every_player",
        seq("place_on_specific_land_id", $._arg),
        seq("avoid_other_land_zones", $._arg),
        "generate_for_first_land_only",
        "set_gaia_object_only",
        "set_gaia_unconvertible",
        "set_building_capturable",
        "make_indestructible",
        seq("min_distance_to_players", $._arg),
        seq("max_distance_to_players", $._arg),
        "set_circular_placement",
        seq("terrain_to_place_on", $._arg),
        seq("layer_to_place_on", $._arg),
        "ignore_terrain_restrictions",
        seq("max_distance_to_other_zones", $._arg),
        "place_on_forest_zone",
        seq("avoid_forest_zone", $._arg),
        seq("avoid_cliff_zone", $._arg),
        seq("min_distance_to_map_edge", $._arg),
        seq("min_distance_group_placement", $._arg),
        seq("temp_min_distance_group_placement", $._arg),
        "find_closest",
        "find_closest_to_map_center",
        "find_closest_to_map_edge",
        "enable_tile_shuffling",
        seq("require_path", $._arg),
        "force_placement",
        seq("actor_area", $._arg),
        seq("actor_area_radius", $._arg),
        "override_actor_radius_if_required",
        seq("actor_area_to_place_in", $._arg),
        seq("avoid_actor_area", $._arg),
        "avoid_all_actor_areas",
        seq("set_facet", $._arg),
        "match_player_civ",
      ),

    _global_statement: ($) =>
      choice(
        $.define_statement,
        $.const_statement,
        $.include_drs,
        $.include_xs,
      ),
    define_statement: ($) => seq("#define", $.identifier),
    const_statement: ($) => seq("#const", $.identifier, $._arg),
    include_drs: ($) => seq("#include_drs", $.filepath),
    include_xs: ($) => seq("#includeXS", $.filepath),

    _arg: ($) => choice($.integer, $.float, $.rnd, $.identifier, $.math_expr),
    integer: ($) => token(prec(1, /[+-]?[0-9]+/)),
    float: ($) => token(prec(1, /[+-]?(inf|[0-9]*\.[0-9]+)/)),
    identifier: ($) => /[^ \t\n\r]+/,
    rnd: ($) => seq(token(prec(1, "rnd")), "(", $.integer, ",", $.integer, ")"),
    math_expr: ($) =>
      seq(
        token(prec(1, "(")),
        $._math_operand,
        repeat(seq($._math_operator, $._math_operand)),
        ")",
      ),
    _math_operand: ($) => choice($.integer, $.float, $.identifier),
    _math_operator: ($) => choice("+", "-", "*", "/", "%"),

    filepath: ($) => choice($.string, $.filename),
    // https://stackoverflow.com/questions/249791/regex-for-quoted-string-with-escaping-quotes
    string: ($) => token(prec(1, /"(?:[^"\\]|\\.)*"/)),
    filename: ($) => /[^ \t\n\r]+/,

    if_directive: ($) => seq("if", $.identifier),
    elseif_directive: ($) => seq("elseif", $.identifier),
    else_directive: ($) => "else",
    endif_directive: ($) => "endif",

    start_random_directive: ($) => "start_random",
    percent_chance_directive: ($) => seq("percent_chance", $.integer),
    end_random_directive: ($) => "end_random",

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
