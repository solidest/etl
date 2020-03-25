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
                "/*return 'COMMENT_BLOCK'*/"
            ],
            [
                [
                    "etl"
                ],
                "\\/\\/[^\\r\\n]*",
                "/*return 'COMMENT_LINE'*/"
            ],
            [
                [
                    "lua"
                ],
                "--\\[\\[(.|\\r\\n|\\r|\\n)*\\]\\]",
                "/*return 'COMMENT_BLOCK'*/"
            ],
            [
                [
                    "lua"
                ],
                "--[^\\n]*",
                "/*return 'COMMENT_LINE'*/"
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
                "$$ = newEtl($etl_element)"
            ],
            [
                "etl etl_element",
                "$$ = addLine($etl, $etl_element)"
            ]
        ],
        "etl_element": [
            [
                "USING str",
                "$$ = newUsing($str)"
            ],
            [
                "block",
                "$$ = $block"
            ]
        ],
        "block": [
            [
                "BLOCK_BEGIN_LUA block_body BLOCK_END",
                "$$ = newBlock('block_lua', @1.startOffset+5, @3.endOffset-2);"
            ],
            [
                "BLOCK_BEGIN_LUA BLOCK_END",
                "$$ = newBlock('block_lua', @1.startOffset+5, @2.endOffset-2);"
            ],
            [
                "BLOCK_BEGIN_ETL block_body BLOCK_END",
                "$$ = newBlock('block_etl', @1.startOffset+2, @3.endOffset-2);"
            ],
            [
                "BLOCK_BEGIN_ETL BLOCK_END",
                "$$ = newBlock('block_etl', @1.startOffset+2, @2.endOffset-2);"
            ]
        ],
        "block_body": [
            [
                "str",
                ""
            ],
            [
                "block_body str",
                ""
            ]
        ],
        "str": [
            [
                "STRING_TRIPLE",
                "$$ = $1"
            ],
            [
                "STRING_SINGLE",
                "$$ = $1"
            ]
        ]
    },
    "moduleInclude": "\n\n    function newBlock(type, from, to) {\n      return { kind: type, from: from, to: to };\n    }\n\n    function newUsing(str) {\n      let len = str.length;\n      let s = str.substring(1, len-2);\n      return { kind: 'using', ref: s };\n    }\n\n    function newEtl(block) {\n      return block ? [block] : [];\n    }\n\n    function addLine(etl, line) {\n      if(line) {\n        etl.push(line);\n      }\n      return etl;\n    }\n"
}