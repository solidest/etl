{
    "rules": [
        [
            "\\s+",
            "/* skip whitespace */"
        ],
        [
            "\\n",
            "return 'NEWLINE'"
        ],
        [
            "\\/*([^*]|(\\*+[^*\\/]))*\\*+\\/",
            "return 'COMMENT_BLOCK'"
        ],
        [
            "\\/\\/[^\\r\\n]*",
            "return 'COMMENT_LINE'"
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
            "as",
            "return 'AS'"
        ],
        [
            "if",
            "return 'IF'"
        ],
        [
            "else",
            "return 'ELSE'"
        ],
        [
            "for",
            "return 'FOR'"
        ],
        [
            "while",
            "return 'WHILE'"
        ],
        [
            "return",
            "return 'RETURN'"
        ],
        [
            "using",
            "return 'USING'"
        ],
        [
            "function",
            "return 'FUNCTION'"
        ],
        [
            "let",
            "return 'LET'"
        ],
        [
            "true",
            "return 'TRUE'"
        ],
        [
            "false",
            "return 'FALSE'"
        ],
        [
            "this",
            "return 'THIS'"
        ],
        [
            "[a-zA-Z_$][a-zA-Z0-9_]*",
            "return 'ID'"
        ],
        [
            "[0-9]+(?:\\.[0-9]+)?",
            "return 'NUMBER'"
        ],
        [
            "0[xX][0-9a-fA-F]+",
            "return 'NUMBER_HEX'"
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
            ";",
            "return ';'"
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
            "return '.'"
        ],
        [
            "!=",
            "return '!='"
        ],
        [
            "!",
            "return '!'"
        ],
        [
            "==",
            "return '=='"
        ],
        [
            "\\+\\+",
            "return '++'"
        ],
        [
            "--",
            "return '--'"
        ],
        [
            "-=",
            "return '-='"
        ],
        [
            "\\+=",
            "return '+='"
        ],
        [
            ">=",
            "return '>='"
        ],
        [
            "<=",
            "return '<='"
        ],
        [
            "&&",
            "return '&&'"
        ],
        [
            "\\|\\|",
            "return '||'"
        ],
        [
            "=",
            "return '='"
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
        ],
        [
            ".",
            "return 'ERROR_LEX'"
        ]
    ]
}