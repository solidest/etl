{
    "lex": {
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
    },
    "operators": [
        [
            "left",
            "AND",
            "OR"
        ],
        [
            "left",
            ">",
            "<",
            "GT_EQ",
            "LT_EQ",
            "EQ_EQ",
            "NOT_EQ"
        ],
        [
            "left",
            "+",
            "-"
        ],
        [
            "left",
            "*",
            "/"
        ],
        [
            "left",
            "UMINUS",
            "NOT"
        ]
    ],
    "bnf": {
        "top_element_list": [
            [
                "top_element",
                ""
            ],
            [
                "top_element_list top_element",
                ""
            ]
        ],
        "top_element": [
            [
                "PROTOCOL ID { }",
                ""
            ],
            [
                "PROTOCOL ID { protocol_element_list }",
                ""
            ],
            [
                "PROGRAM ID { }",
                ""
            ],
            [
                "PROGRAM ID { program_element_list }",
                ""
            ]
        ],
        "protocol_element_list": [
            [
                "protocol_element",
                ""
            ],
            [
                "protocol_element_list protocol_element",
                ""
            ]
        ],
        "protocol_element": [
            [
                "SEGMENT ID object_like",
                ""
            ],
            [
                "segments",
                ""
            ],
            [
                "branch",
                ""
            ]
        ],
        "segments": [
            [
                "SEGMENTS ID { }",
                ""
            ],
            [
                "SEGMENTS ID { protocol_element_list }",
                ""
            ]
        ],
        "branch": [
            [
                "WHEN ( exp ) { }",
                ""
            ],
            [
                "WHEN ( exp ) { protocol_element_list }",
                ""
            ],
            [
                "ONEOF ( exp ) { }",
                ""
            ],
            [
                "ONEOF ( exp ) { protocol_element_list }",
                ""
            ]
        ],
        "program_element_list": [],
        "object_like": [
            [
                "{ }",
                ""
            ],
            [
                "{ property_list }",
                ""
            ]
        ],
        "property_list": [
            [
                "property_setting",
                ""
            ],
            [
                "property_list , property_setting",
                ""
            ],
            [
                "property_list ,",
                ""
            ]
        ],
        "property_setting": [
            [
                "ID : exp",
                ""
            ]
        ],
        "exp": [
            [
                "literal",
                ""
            ],
            [
                "object_like",
                ""
            ],
            [
                "NOT exp",
                ""
            ],
            [
                "- exp",
                "",
                {
                    "prec": "UMINUS"
                }
            ],
            [
                "exp_compare",
                ""
            ],
            [
                "exp_calc",
                ""
            ],
            [
                "exp_bin",
                ""
            ],
            [
                "( exp )",
                ""
            ],
            [
                "[ ]",
                ""
            ],
            [
                "[ arrlist ]",
                ""
            ],
            [
                "fn_call",
                ""
            ]
        ],
        "exp_compare": [
            [
                "exp NOT_EQ exp",
                ""
            ],
            [
                "exp EQ_EQ exp",
                ""
            ],
            [
                "exp GT_EQ exp",
                ""
            ],
            [
                "exp LT_EQ exp",
                ""
            ],
            [
                "exp > exp",
                ""
            ],
            [
                "exp < exp",
                ""
            ]
        ],
        "exp_bin": [
            [
                "exp AND exp",
                ""
            ],
            [
                "exp OR exp",
                ""
            ]
        ],
        "exp_calc": [
            [
                "exp + exp",
                ""
            ],
            [
                "exp - exp",
                ""
            ],
            [
                "exp * exp",
                ""
            ],
            [
                "exp / exp",
                ""
            ]
        ],
        "fn_call": [
            [
                "pid ( )",
                ""
            ],
            [
                "pid ( arrlist )",
                ""
            ]
        ],
        "arrlist": [
            [
                "exp",
                ""
            ],
            [
                "arrlist , exp",
                ""
            ],
            [
                "arrlist ,",
                ""
            ]
        ],
        "literal": [
            [
                "NUMBER",
                ""
            ],
            [
                "NUMBER_HEX",
                ""
            ],
            [
                "STRING_TRIPLE",
                ""
            ],
            [
                "STRING_SINGLE",
                ""
            ],
            [
                "STRING_HEX",
                ""
            ],
            [
                "pid",
                ""
            ]
        ],
        "pid": [
            [
                "ID",
                ""
            ],
            [
                "pid DOT ID",
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
            ],
            [
                "STRING_HEX",
                ""
            ]
        ]
    },
    "moduleInclude": "\n\n    function newBlock(type, from, to) {\n      return { kind: type, from: from, to: to };\n    }\n\n    function newUsing(str) {\n      let len = str.length;\n      let s = str.substring(1, len-2);\n      return { kind: 'using', ref: s };\n    }\n\n    function newEtl(block) {\n      return block ? [block] : [];\n    }\n\n    function addLine(etl, line) {\n      if(line) {\n        etl.push(line);\n      }\n      return etl;\n    }\n"
}