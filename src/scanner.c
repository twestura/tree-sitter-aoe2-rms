#include "tree_sitter/parser.h"

/// Type of tokens produced by the scanner.
enum TokenType {
    COMMENT,
    ERROR_SENTINEL,
};

void * tree_sitter_aoe2_rms_external_scanner_create() {
    return NULL;
}

void tree_sitter_aoe2_rms_external_scanner_destroy(void *payload) {}

unsigned tree_sitter_aoe2_rms_external_scanner_serialize(
    void *payload, char *buffer
) {
    return 0;
}

void tree_sitter_aoe2_rms_external_scanner_deserialize(
    void *payload, const char *buffer, unsigned length
) {}

/// Returns `true` if the character is a whitespace character, `false` otherwise.
bool is_whitespace(char c) {
    return c == ' ' || c == '\t' || c == '\n' || c == '\r';
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
/// This function does not set `lexer->result_symbol = COMMENT` on
/// returning `true`. That must be set by the calling code. Use
/// `accept_block_comment` instead for a version that sets `result_symbol`
/// and uses this function internally.
///
/// The comment start and end characters must be surrounded by whitespace.
/// This is not checked for the left of the initial start comment of the lexer,
/// but is for all subsequent comments.
///
/// Requires that whitespace is advanced past before calling this function.
bool match_block_comment(TSLexer * lexer) {
    if (lexer->lookahead != '/') return false;
    lexer->advance(lexer, false);
    if (lexer->lookahead != '*') return false;
    lexer->advance(lexer, false);
    if (lexer->eof(lexer)) return true;
    if (!is_whitespace(lexer->lookahead)) return false;
    lexer->advance(lexer, false);

    int depth = 1;
    enum CommentState state = WHITESPACE;
    for (;;) {
        if (lexer->eof(lexer)) return true;
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
                if (is_whitespace(c)) {
                    // End of comment at depth 0, return without advancing.
                    if (--depth == 0) return true;
                    state = WHITESPACE;
                } else state = NONWHITESPACE;
                break;
            default:
                break;
        }
        // Advance after every non-return state.
        lexer->advance(lexer, false);
    }
}

/// Returns `true` if the lexer starts with a comment, and if so advances the
/// lexer past it. Includes cases for comments that reach the end of the file,
/// in which case `true` is returned.
/// Returns `false` if the lexer does not start with a comment.
/// Sets `lexer->result_symbol` to `COMMENT` if a comment is matched.
bool accept_block_comment(TSLexer *lexer) {
    if (!match_block_comment(lexer)) return false;
    lexer->result_symbol = COMMENT;
    return true;
}

bool tree_sitter_aoe2_rms_external_scanner_scan(
    void *scanner, TSLexer *lexer, const bool *valid_symbols
) {
    if (valid_symbols[ERROR_SENTINEL]) return false;
    while (is_whitespace(lexer->lookahead)) lexer->advance(lexer, true);
    return valid_symbols[COMMENT] && accept_block_comment(lexer);
}
