#include "tree_sitter/parser.h"
// #include <stdio.h>
// TODO clean inputs.

/// Type of tokens produced by the scanner.
enum TokenType {
    ERROR_SENTINEL,
};

void * tree_sitter_aoe2_rms_external_scanner_create() {
    // fprintf(stderr, "[scanner] create\n");
    return NULL;
}

void tree_sitter_aoe2_rms_external_scanner_destroy(void *payload) {
    // fprintf(stderr, "[scanner] destroy\n");
}

unsigned tree_sitter_aoe2_rms_external_scanner_serialize(
    void *payload, char *buffer
) {
    // fprintf(stderr, "[scanner] serialize\n");
    return 0;
}

void tree_sitter_aoe2_rms_external_scanner_deserialize(
    void *payload, const char *buffer, unsigned length
) {
    // fprintf(stderr, "[scanner] deserialize\n");
}

bool tree_sitter_aoe2_rms_external_scanner_scan(
    void *scanner, TSLexer *lexer, const bool *valid_symbols
) {
    return false;
}
