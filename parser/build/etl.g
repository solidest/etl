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
                "as",
                "return 'AS'"
            ],
            [
                "[a-zA-Z_][a-zA-Z0-9_]*",
                "return 'ID'"
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
                "$$ = newList($etl_element)"
            ],
            [
                "etl etl_element",
                "$$ = joinList($etl, $etl_element)"
            ]
        ],
        "etl_element": [
            [
                "USING str AS ID",
                "$$ = newUsing($str, $ID)"
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
                "$$ = newBlock('block_etx', @1.startOffset+2, @3.endOffset-2);"
            ],
            [
                "BLOCK_BEGIN_ETL BLOCK_END",
                "$$ = newBlock('block_etx', @1.startOffset+2, @2.endOffset-2);"
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
    "moduleInclude": "\n\n    function newBlock(type, from, to) {\n      return { kind: type, from: from, to: to };\n    }\n\n    function newUsing(str, id) {\n      return { kind: 'using', ref: eval(str), pkg: id };\n    }\n\n    function newList(item) {\n      return item ? [item] : [];\n    }\n\n    function joinList(list, item) {\n      if(list && item) {\n        list.push(item);\n      }\n      return list;\n    }\n\n    function getRef(str) {\n      let s = eval(str);\n      if(s && s.endsWith(\".lua\")) {\n        return s;\n      }\n      return null;\n    }\n"
}