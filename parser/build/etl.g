{
    "lex": {
        "startConditions": {
            "etl": 1,
            "lua": 1
        },
        "rules": [
            [
                [
                    "etl"
                ],
                "\\/\\*[^*]*\\*+([^\\/][^*]*\\*+)*\\/",
                "return 'COMMENT_BLOCK'"
            ],
            [
                [
                    "etl"
                ],
                "\\/\\/[^\\r\\n]*",
                "return 'COMMENT_LINE'"
            ],
            [
                [
                    "lua"
                ],
                "--\\[\\[(.|\\r\\n|\\r|\\n)*\\]\\]",
                "return 'COMMENT_BLOCK'"
            ],
            [
                [
                    "lua"
                ],
                "--[^\\n]*",
                "return 'COMMENT_LINE'"
            ],
            [
                [
                    "*"
                ],
                "\\\"([^\\\\\\n\"]|\\\\.)*\\\"",
                "return 'STRING_TRIPLE'"
            ],
            [
                [
                    "*"
                ],
                "'([^\\\\\\n']|\\\\.)*'",
                "return 'STRING_SINGLE'"
            ],
            [
                "using",
                "return 'USING'"
            ],
            [
                "<%lua",
                "this.pushState('lua'); return 'BLOCK_BEGIN_LUA'"
            ],
            [
                "<%",
                "this.pushState('etl'); return 'BLOCK_BEGIN_ETL'"
            ],
            [
                [
                    "lua",
                    "etl"
                ],
                "%>",
                "this.popState(); return 'BLOCK_END'"
            ],
            [
                [
                    "*"
                ],
                "\\n",
                "/*return 'NEWLINE'*/"
            ],
            [
                [
                    "*"
                ],
                ".",
                "/*return 'ANY_OTHER'*/"
            ]
        ]
    },
    "bnf": {
        "etl": [
            [
                "etl_element",
                ""
            ],
            [
                "etl etl_element",
                ""
            ]
        ],
        "etl_element": [
            [
                "USING str",
                ""
            ],
            [
                "comment",
                ""
            ],
            [
                "block",
                ""
            ]
        ],
        "block": [
            [
                "BLOCK_BEGIN_LUA block_body BLOCK_END"
            ],
            [
                "BLOCK_BEGIN_ETL block_body BLOCK_END"
            ]
        ],
        "block_body": [
            [
                "body_line",
                ""
            ],
            [
                "block_body body_line",
                ""
            ]
        ],
        "body_line": [
            [
                "comment",
                ""
            ],
            [
                "str",
                ""
            ]
        ],
        "str": [
            [
                "STRING_TRIPLE",
                ""
            ],
            [
                "STRING_SINGLE",
                ""
            ]
        ],
        "comment": [
            [
                "COMMENT_BLOCK",
                ""
            ],
            [
                "COMMENT_LINE",
                ""
            ]
        ]
    }
}