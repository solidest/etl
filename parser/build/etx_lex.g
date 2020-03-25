{
    "rules": [
        [
            "\\/\\*[^*]*\\*+([^\\/][^*]*\\*+)*\\/",
            "/*return 'COMMENT_BLOCK'*/"
        ],
        [
            "\\/\\/[^\\r\\n]*",
            "/*return 'COMMENT_LINE'*/"
        ],
        [
            "\\\"([^\\\\\\n\"]|\\\\.)*\\\"",
            "return 'STRING_TRIPLE'"
        ],
        [
            "'([^\\\\\\n']|\\\\.)*'",
            "return 'STRING_SINGLE'"
        ],
        [
            "%[0-9A-Fa-f\\s]*%",
            "return 'STRING_HEX'"
        ],
        [
            "\\s+",
            "/* return 'WHITESPACE' */"
        ],
        [
            "\\n",
            "/* return 'NEWLINE' */"
        ],
        [
            "protocol",
            "return 'PROTOCOL'"
        ],
        [
            "program",
            "return 'PROGRAM"
        ],
        [
            "segments",
            "return 'SEGMENTS'"
        ],
        [
            "segment",
            "return 'SEGMENT'"
        ],
        [
            "when",
            "return 'WHEN'"
        ],
        [
            "oneof",
            "return 'ONEOF'"
        ],
        [
            "0[xX][0-9a-fA-F]+",
            "return 'NUMBER_HEX'"
        ],
        [
            "[0-9]+(?:\\.[0-9]+)?",
            "return 'NUMBER'"
        ],
        [
            "[a-zA-Z_$][a-zA-Z0-9_]*",
            "return 'ID'"
        ],
        [
            "!=",
            "return 'NOT_EQ'"
        ],
        [
            "!",
            "return 'NOT'"
        ],
        [
            "==",
            "return 'EQ_EQ'"
        ],
        [
            ">=",
            "return 'GT_EQ'"
        ],
        [
            "<=",
            "return 'LT_EQ'"
        ],
        [
            "&&",
            "return 'AND'"
        ],
        [
            "\\|\\|",
            "return 'OR'"
        ],
        [
            "{",
            "return '{'"
        ],
        [
            "}",
            "return '}'"
        ],
        [
            "]",
            "return ']'"
        ],
        [
            "\\[",
            "return '['"
        ],
        [
            ",",
            "return ','"
        ],
        [
            "\\:",
            "return ':'"
        ],
        [
            "\\.",
            "return 'DOT'"
        ],
        [
            "\\+",
            "return '+'"
        ],
        [
            "-",
            "return '-'"
        ],
        [
            "\\*",
            "return '*'"
        ],
        [
            "\\/",
            "return '/'"
        ],
        [
            "\\(",
            "return '('"
        ],
        [
            "\\)",
            "return ')'"
        ],
        [
            ">",
            "return '>'"
        ],
        [
            "<",
            "return '<'"
        ]
    ]
}