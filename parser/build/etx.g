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
                "return 'PROGRAM'"
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
                "$$ = newList($top_element);"
            ],
            [
                "top_element_list top_element",
                "$$ = joinList($top_element_list, $top_element);"
            ]
        ],
        "top_element": [
            [
                "PROTOCOL ID { }",
                "newElement('protocol', $ID, 'seglist', null, @ID);"
            ],
            [
                "PROTOCOL ID { protocol_element_list }",
                "$$ = newElement('protocol', $ID,'seglist', $protocol_element_list, @ID);"
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
                "$$ = newList($protocol_element);"
            ],
            [
                "protocol_element_list protocol_element",
                "$$ = joinList($protocol_element_list, $protocol_element)"
            ]
        ],
        "protocol_element": [
            [
                "SEGMENT ID object_like",
                "$$ = newElement('segment', $ID, 'props', $object_like, @ID);"
            ],
            [
                "segments",
                "$$ = $segments;"
            ],
            [
                "branch",
                "$$ = $branch;"
            ]
        ],
        "segments": [
            [
                "SEGMENTS ID { }",
                "$$ = newProtSeggroup($ID, null, @ID);"
            ],
            [
                "SEGMENTS ID { protocol_element_list }",
                "$$ = newProtSeggroup($ID, $protocol_element_list, @ID);"
            ]
        ],
        "branch": [
            [
                "WHEN ( exp ) { }",
                "$$ = newProtBranch('when', $exp, null, @exp);"
            ],
            [
                "WHEN ( exp ) { protocol_element_list }",
                "$$ = newProtBranch('when', $exp, $protocol_element_list, @exp);"
            ],
            [
                "ONEOF ( exp ) { }",
                "$$ = newProtBranch('oneof', $exp, null, @exp);"
            ],
            [
                "ONEOF ( exp ) { protocol_element_list }",
                "$$ = newProtBranch('oneof', $exp, $protocol_element_list, @exp);"
            ]
        ],
        "program_element_list": [],
        "object_like": [
            [
                "{ }",
                "$$ = newList(null);"
            ],
            [
                "{ property_list }",
                "$$ = $property_list;"
            ]
        ],
        "property_list": [
            [
                "property_setting",
                "$$ = newList($property_setting);"
            ],
            [
                "property_list , property_setting",
                "$$ = joinList($property_list, $property_setting);"
            ],
            [
                "property_list ,",
                "$$ = $property_list;"
            ]
        ],
        "property_setting": [
            [
                "ID : exp",
                "$$ = newProp($ID, $exp, @ID, @exp);"
            ]
        ],
        "exp": [
            [
                "literal",
                "$$ = $literal;"
            ],
            [
                "object_like",
                "$$ = $object_like;"
            ],
            [
                "NOT exp",
                "$$ = {kind: 'not', exp: $exp};"
            ],
            [
                "- exp",
                "$$ = {kind: 'uminus', exp: $exp};",
                {
                    "prec": "UMINUS"
                }
            ],
            [
                "exp_compare",
                "$$ = $exp_compare;"
            ],
            [
                "exp_calc",
                "$$ = $exp_calc;"
            ],
            [
                "exp_bin",
                "$$ = $exp_bin;"
            ],
            [
                "( exp )",
                "$$ = $exp;"
            ],
            [
                "[ ]",
                "$$ = newKindList('array', null);"
            ],
            [
                "[ arrlist ]",
                "$$ = $arrlist;"
            ],
            [
                "fn_call",
                "$$ = $fn_call;"
            ]
        ],
        "exp_compare": [
            [
                "exp NOT_EQ exp",
                "$$ = {kind: 'not_eq', left: $1, right: $3};"
            ],
            [
                "exp EQ_EQ exp",
                "$$ = {kind: 'eq_eq', left: $1, right: $3};"
            ],
            [
                "exp GT_EQ exp",
                "$$ = {kind: 'gt_eq', left: $1, right: $3};"
            ],
            [
                "exp LT_EQ exp",
                "$$ = {kind: 'lt_eq', left: $1, right: $3};"
            ],
            [
                "exp > exp",
                "$$ = {kind: 'gt', left: $1, right: $3};"
            ],
            [
                "exp < exp",
                "$$ = {kind: 'lt', left: $1, right: $3};"
            ]
        ],
        "exp_bin": [
            [
                "exp AND exp",
                "$$ = {kind: 'and', left: $1, right: $3};"
            ],
            [
                "exp OR exp",
                "$$ = {kind: 'or', left: $1, right: $3};"
            ]
        ],
        "exp_calc": [
            [
                "exp + exp",
                "$$ = {kind: 'add', left: $1, right: $3};"
            ],
            [
                "exp - exp",
                "$$ = {kind: 'subtract', left: $1, right: $3};"
            ],
            [
                "exp * exp",
                "$$ = {kind: 'multiply', left: $1, right: $3};"
            ],
            [
                "exp / exp",
                "$$ = {kind: 'divide', left: $1, right: $3};"
            ]
        ],
        "fn_call": [
            [
                "pid ( )",
                "$$ = {kind: 'fn_call', pname: $pid};"
            ],
            [
                "pid ( arrlist )",
                "$$ = {kind: 'fn_call', pname: $pid, args: $arrlist};"
            ]
        ],
        "arrlist": [
            [
                "exp",
                "$$ = newKindList('array', $exp);"
            ],
            [
                "arrlist , exp",
                "$$ = joinKindList($arrlist, $exp);"
            ],
            [
                "arrlist ,",
                "$$ = $arrlist;"
            ]
        ],
        "literal": [
            [
                "NUMBER",
                "$$ = {kind: 'number', value: eval(yytext)};"
            ],
            [
                "NUMBER_HEX",
                "$$ = {kind: 'number', value: eval(yytext)};"
            ],
            [
                "str",
                "$$ = $str;"
            ],
            [
                "pid",
                "$$ = $pid;"
            ]
        ],
        "pid": [
            [
                "ID",
                "$$ = newKindList('pid', $1);"
            ],
            [
                "pid DOT ID",
                "$$ = joinKindList($pid, $ID);"
            ]
        ],
        "str": [
            [
                "STRING_TRIPLE",
                "$$ = {kind: 'string', value: eval(yytext)};"
            ],
            [
                "STRING_SINGLE",
                "$$ = {kind: 'string', value: eval(yytext)};"
            ],
            [
                "STRING_HEX",
                "$$ = {kind: 'strhex',  value: yytext};"
            ]
        ]
    },
    "moduleInclude": "\n\n    function newList(item) {\n      if(item) {\n        return [item];\n      } else {\n        return [];\n      }\n    }\n\n    function joinList(list, item) {\n      if(list && item) {\n        list.push(item);\n      }\n      return list;\n    }\n\n    function newKindList(kind, item) {\n      if(item) {\n        return {kind: kind, list: [item]};\n      } else {\n        return {kind: kind, list: []};\n      }\n    }\n\n    function joinKindList(list, item) {\n      if(list && list.list && item) {\n        list.list.push(item);\n      }\n      return list;\n    }\n\n    function newProp(id, exp, id_loc, exp_loc) {\n      return {\n        kind: 'prop',\n        name: id,\n        value: exp,\n        name_from: id_loc.startOffset,\n        name_to: id_loc.endOffset,\n        value_from: exp_loc.startOffset,\n        value_to: exp_loc.endOffset,\n      }\n    }\n\n    function newProtBranch(kind, exp, seglist, exp_loc) {\n      return {\n        kind: kind,\n        exp: exp,\n        seglist: seglist,\n        exp_from: exp_loc.startOffset,\n        exp_to: exp_loc.endOffset,\n      }\n    }\n\n    function newProtSeggroup(name, seglist, name_loc) {\n      return {\n        kind: 'seggroup',\n        name: name,\n        seglist: seglist,\n        name_from: name_loc.startOffset,\n        name_to: name_loc.endOffset,\n      }\n    }\n\n    function newElement(kind, name, body_name, body, name_loc) {\n      let res = {\n        kind: kind,\n        name: name,\n        name_from: name_loc.startOffset,\n        name_to: name_loc.endOffset,\n      }\n      res[body_name] = body;\n      return res;\n    }\n\n\n"
}