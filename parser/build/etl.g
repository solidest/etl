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
                "$$ = newList($etl_element)"
            ],
            [
                "etl etl_element",
                "$$ = joinList($etl, $etl_element)"
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
                "$$ = newBlock('block_lua', $block_body, @1.startOffset+5, @3.endOffset-2);"
            ],
            [
                "BLOCK_BEGIN_LUA BLOCK_END",
                "$$ = newBlock('block_lua', null, @1.startOffset+5, @2.endOffset-2);"
            ],
            [
                "BLOCK_BEGIN_ETL block_body BLOCK_END",
                "$$ = newBlock('block_etx', null, @1.startOffset+2, @3.endOffset-2);"
            ],
            [
                "BLOCK_BEGIN_ETL BLOCK_END",
                "$$ = newBlock('block_etx', null, @1.startOffset+2, @2.endOffset-2);"
            ]
        ],
        "block_body": [
            [
                "str",
                "$$ = newList(getRef(yytext))"
            ],
            [
                "block_body str",
                "$$ = joinList($block_body, getRef(yytext))"
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
    "moduleInclude": "\n\n    function newBlock(type, refs, from, to) {\n      return { kind: type, refs: refs, from: from, to: to };\n    }\n\n    function newUsing(str) {\n      return { kind: 'using', ref: eval(str) };\n    }\n\n    function newList(item) {\n      return item ? [item] : [];\n    }\n\n    function joinList(list, item) {\n      if(list && item) {\n        list.push(item);\n      }\n      return list;\n    }\n\n    function getRef(str) {\n      let s = eval(str);\n      if(s && s.endsWith(\".lua\")) {\n        return s;\n      }\n      return null;\n    }\n"
}