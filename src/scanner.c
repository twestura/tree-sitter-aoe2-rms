#include "tree_sitter/alloc.h"
#include "tree_sitter/parser.h"
#include <stdio.h>
// TODO clean inputs.

/// Type of tokens produced by the scanner.
enum TokenType {
    LBRACE,
    RBRACE,
    BASE_TERRAIN_CMD,
    BASE_TERRAIN_ATTR,
    BASE_LAYER_CMD,
    BASE_LAYER_ATTR,
    COMMENT,
    ERROR_SENTINEL,
};

/// State of the scanner object to track the most recently seen { or } character.
typedef struct {
    /// `0` if not curly brace is seen, or if `}` is the most recently seen.
    /// `1` if `{` is the most recently seen.
    uint8_t seen_open_brace;
} Scanner;

void * tree_sitter_aoe2_rms_external_scanner_create() {
    return ts_calloc(1, sizeof(Scanner));
}

void tree_sitter_aoe2_rms_external_scanner_destroy(void *payload) {
    ts_free((Scanner *) payload);
}

unsigned tree_sitter_aoe2_rms_external_scanner_serialize(
    void *payload, char *buffer
) {
    buffer[0] = (char) ((Scanner *) payload)->seen_open_brace;
    return 1;
}

void tree_sitter_aoe2_rms_external_scanner_deserialize(
    void *payload, const char *buffer, unsigned length
) {
    ((Scanner *) payload)->seen_open_brace = (length == 1) ? buffer[0] : 0;
}

/// Returns `true` if the character is a whitespace character, `false` otherwise.
bool is_whitespace(char c) {
    return c == ' ' || c == '\t' || c == '\n' || c == '\r';
}

/// Returns `true` if the lexer's current position starts with the the string
/// `prefix`. Advances the lexer past the prefix if it matches.
/// Returns `false` if the lexer's current position does not start with `prefix,
/// and advances the lexer as far as possible until a mismatched character..
bool starts_with(TSLexer* lexer, const char * prefix) {
    for (int i = 0; prefix[i] != '\0'; ++i) {
        if (lexer->lookahead != prefix[i]) return false;
        lexer->advance(lexer, false);
    }
    return true;
}

/// The state of parsing a block comment.
enum CommentState {
    /// A LEFT_SLASH must be preceeded by WHITESPACE.
    LEFT_SLASH,
    /// A LEFT_START must be preceeded by a LEFT_SLASH.
    LEFT_STAR,
    /// Whitespace characters.
    WHITESPACE,
    /// Generic non-whitespace character without a special meaning.
    NONWHITESPACE,
    /// A RIGHT_START must be preceeded by WHITESPACE.
    RIGHT_STAR,
    /// A RIGHT_SLASH must be preceeded by a RIGHT_STAR.
    RIGHT_SLASH,
};

/// Returns `true` if the lexer starts with a comment, and if so advances the
/// lexer past it. Includes cases for comments that reach the end of the file,
/// in which case `true` is returned.
/// Returns `false` if the lexer does not start with a comment.
/// Supports nested comments.
///
/// The comment start and end characters must be surrounded by whitespace.
/// This is not checked for the left of the initial start comment of the lexer,
/// but is for all subsequent comments.
///
/// Requires that whitespace is advanced past before calling this function.
bool handle_block_comment(TSLexer * lexer) {
    if (lexer->lookahead != '/') return false;
    lexer->advance(lexer, false);
    if (lexer->lookahead != '*') return false;
    lexer->advance(lexer, false);
    if (lexer->eof(lexer)) return true; // Comment reaches eof.
    if (!is_whitespace(lexer->lookahead)) return false;
    lexer->advance(lexer, false);

    int depth = 1;
    enum CommentState state = WHITESPACE;
    for (;;) {
        // fprintf(stderr, "char: %c, state: %d\n", lexer->lookahead, state);
        if (lexer->eof(lexer)) {
            lexer->result_symbol = COMMENT;
            return true; // Comment reaches eof.
        }
        char c = lexer->lookahead;
        switch (state) {
            case LEFT_SLASH:
                if (c == '*') state = LEFT_STAR;
                else if (is_whitespace(c)) state = WHITESPACE;
                else state = NONWHITESPACE;
                break;
            case LEFT_STAR:
                if (is_whitespace(c)) {
                    state = WHITESPACE;
                    ++depth;
                } else state = NONWHITESPACE;
                break;
            case WHITESPACE:
                if (c == '/') state = LEFT_SLASH;
                else if (c == '*') state = RIGHT_STAR;
                else if (!is_whitespace(c)) state = NONWHITESPACE;
                break;
            case NONWHITESPACE:
                if (is_whitespace(c)) state = WHITESPACE;
                break;
            case RIGHT_STAR:
                if (c == '/') state = RIGHT_SLASH;
                else if (is_whitespace(c)) state = WHITESPACE;
                else state = NONWHITESPACE;
                break;
            case RIGHT_SLASH:
                // End of comment at depth 0, return without advancing.
                if (is_whitespace(c) && --depth == 0) {
                    lexer->result_symbol = COMMENT;
                    return true;
                }
                state = NONWHITESPACE;
                break;
            default:
                break;
        }
        // Advance after every non-return state.
        lexer->advance(lexer, false);
    }
}

bool tree_sitter_aoe2_rms_external_scanner_scan(
    void *scanner, TSLexer *lexer, const bool *valid_symbols
) {
    // fprintf(
    //     stderr,
    //     "[%i, %i, %i, %i, %i, %i, %i, %i]\n",
    //     valid_symbols[LBRACE], valid_symbols[RBRACE],
    //     valid_symbols[BASE_TERRAIN_CMD], valid_symbols[BASE_TERRAIN_ATTR],
    //     valid_symbols[BASE_LAYER_CMD], valid_symbols[BASE_LAYER_ATTR],
    //     valid_symbols[COMMENT], valid_symbols[ERROR_SENTINEL]
    // );
    if (valid_symbols[ERROR_SENTINEL]) return false;
    Scanner * s = (Scanner *) scanner;
    while (is_whitespace(lexer->lookahead)) lexer->advance(lexer, true);

    if (valid_symbols[COMMENT] && lexer->lookahead == '/')
        return handle_block_comment(lexer);

    if (valid_symbols[LBRACE] && lexer->lookahead == '{') {
        lexer->advance(lexer, false);
        lexer->result_symbol = LBRACE;
        s->seen_open_brace = 1;
        return true;
    }
    if (valid_symbols[RBRACE] && lexer->lookahead == '}') {
        lexer->advance(lexer, false);
        lexer->result_symbol = RBRACE;
        s->seen_open_brace = 0;
        return true;
    }

    if (
        (valid_symbols[BASE_TERRAIN_CMD]
        || valid_symbols[BASE_TERRAIN_ATTR]
        || valid_symbols[BASE_LAYER_CMD]
        || valid_symbols[BASE_LAYER_ATTR]) && lexer->lookahead == 'b'
    ) {
        if (!starts_with(lexer, "base_")) return false;
        if (starts_with(lexer, "terrain")) {
            lexer->result_symbol = s->seen_open_brace
                ? BASE_TERRAIN_ATTR
                : BASE_TERRAIN_CMD;
            return true;
        }
        if (starts_with(lexer, "layer")) {
            lexer->result_symbol = s->seen_open_brace
                ? BASE_LAYER_ATTR
                : BASE_LAYER_CMD;
            return true;
        }
        return false;
    }

    return false;
}
