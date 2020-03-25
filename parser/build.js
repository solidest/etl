var fs = require("fs");
var path = require("path");

let lex_main = {
  startConditions: {
    etl: 1,
    lua: 1
  },
  rules: [
    [["etl"], "\\/\\*[^*]*\\*+([^\\/][^*]*\\*+)*\\/", "/*return 'COMMENT_BLOCK'*/"],
    [["etl"], "\\/\\/[^\\r\\n]*", "/*return 'COMMENT_LINE'*/"],
    [["lua"], "--\\[\\[(.|\\r\\n|\\r|\\n)*\\]\\]", "/*return 'COMMENT_BLOCK'*/"],
    [["lua"], "--[^\\n]*", "/*return 'COMMENT_LINE'*/"],
    [["*"], "\\\"([^\\\\\\n\"]|\\\\.)*\\\"", "return 'STRING_TRIPLE'"],
    [["*"], "'([^\\\\\\n']|\\\\.)*'", "return 'STRING_SINGLE'"],
    ["using", "return 'USING'"],
    ["<%lua", "this.pushState('lua'); return 'BLOCK_BEGIN_LUA'"],
    ["<%", "this.pushState('etl'); return 'BLOCK_BEGIN_ETL'"],
    [["lua", "etl"], "%>", "this.popState(); return 'BLOCK_END'"],
    [["*"], "\\n", "/*return 'NEWLINE'*/"],
    [["*"], ".", "/*return 'ANY_OTHER'*/"],
  ],
}

let bnf_main = {
  
  etl: [
    ["etl_element", "$$ = newEtl($etl_element)"],
    ["etl etl_element", "$$ = addLine($etl, $etl_element)"]
  ],

  etl_element: [
    ["USING str", "$$ = newUsing($str)"],
    ["block", "$$ = $block"],
  ],

  block: [
    ["BLOCK_BEGIN_LUA block_body BLOCK_END", "$$ = newBlock('block_lua', @1.startOffset+5, @3.endOffset-2);"],
    ["BLOCK_BEGIN_LUA BLOCK_END", "$$ = newBlock('block_lua', @1.startOffset+5, @2.endOffset-2);"],
    ["BLOCK_BEGIN_ETL block_body BLOCK_END", "$$ = newBlock('block_etl', @1.startOffset+2, @3.endOffset-2);"],
    ["BLOCK_BEGIN_ETL BLOCK_END", "$$ = newBlock('block_etl', @1.startOffset+2, @2.endOffset-2);"],
  ],

  block_body: [
    ["str", ""],
    ["block_body str", ""]
  ],

  str: [
    ["STRING_TRIPLE", "$$ = $1"],
    ["STRING_SINGLE", "$$ = $1"],
  ],
}

let include_main = `

    function newBlock(type, from, to) {
      return { kind: type, from: from, to: to };
    }

    function newUsing(str) {
      let len = str.length;
      let s = str.substring(1, len-2);
      return { kind: 'using', ref: s };
    }

    function newEtl(block) {
      return block ? [block] : [];
    }

    function addLine(etl, line) {
      if(line) {
        etl.push(line);
      }
      return etl;
    }
`

let lex_etx = {
  rules: [
    ["\\/\\*[^*]*\\*+([^\\/][^*]*\\*+)*\\/", "/*return 'COMMENT_BLOCK'*/" ],
    ["\\/\\/[^\\r\\n]*", "/*return 'COMMENT_LINE'*/"],
    ["\\\"([^\\\\\\n\"]|\\\\.)*\\\"", "return 'STRING_TRIPLE'"],
    ["'([^\\\\\\n']|\\\\.)*'", "return 'STRING_SINGLE'"],
    ["%[0-9A-Fa-f\\s]*%", "return 'STRING_HEX'"],
    ["\\s+", "/* return 'WHITESPACE' */"],
    ["\\n", "/* return 'NEWLINE' */"],
    ["protocol", "return 'PROTOCOL'"],
    ["program", "return 'PROGRAM"],
    ["segments", "return 'SEGMENTS'"],
    ["segment", "return 'SEGMENT'"],
    ["when", "return 'WHEN'"],
    ["oneof", "return 'ONEOF'"],
    ["0[xX][0-9a-fA-F]+", "return 'NUMBER_HEX'"],
    ["[0-9]+(?:\\.[0-9]+)?", "return 'NUMBER'"],
    ["[a-zA-Z_$][a-zA-Z0-9_]*", "return 'ID'"],
    ["!=", "return 'NOT_EQ'"],
    ["!", "return 'NOT'"],
    ["==", "return 'EQ_EQ'"],
    [">=", "return 'GT_EQ'"], 
    ["<=", "return 'LT_EQ'"], 
    ["&&", "return 'AND'"],
    ["\\|\\|", "return 'OR'"], 
    ["{", "return '{'"],
    ["}", "return '}'"],
    ["]", "return ']'"],
    ["\\[", "return '['"],
    [",", "return ','"],
    ["\\:", "return ':'"],
    ["\\.", "return 'DOT'"],
    ["\\+", "return '+'"],
    ["-", "return '-'"],
    ["\\*", "return '*'"],
    ["\\/", "return '/'"],
    ["\\(", "return '('"],
    ["\\)", "return ')'"],
    [">", "return '>'"], 
    ["<", "return '<'"],
  ],
}

let bnf_etx = {
  top_element_list: [
    ["top_element", ""],
    ["top_element_list top_element", ""]
  ],

  top_element: [
    ["PROTOCOL ID { }", ""],
    ["PROTOCOL ID { protocol_element_list }", ""],
    ["PROGRAM ID { }", ""],
    ["PROGRAM ID { program_element_list }", ""],
  ],

  // protocol
  protocol_element_list: [
    ["protocol_element", ""],
    ["protocol_element_list protocol_element", ""]
  ],

  protocol_element: [
    ["SEGMENT ID object_like", ""],
    ["segments", ""],
    ["branch", ""],
  ],

  segments: [
    ["SEGMENTS ID { }", ""],
    ["SEGMENTS ID { protocol_element_list }", ""],
  ],

  branch: [
    ["WHEN ( exp ) { }", ""],
    ["WHEN ( exp ) { protocol_element_list }", ""],
    ["ONEOF ( exp ) { }", ""],
    ["ONEOF ( exp ) { protocol_element_list }", ""],
  ],

  // program
  program_element_list: [
    
  ],


  // common
  object_like: [
    ["{ }", ""],
    ["{ property_list }", ""],
  ],

  property_list: [
    ["property_setting", ""],
    ["property_list , property_setting", ""],
    ["property_list ,", ""],
  ],

  property_setting: [
    ["ID : exp", ""]
  ],

  exp: [
    ["literal", ""],
    ["object_like", ""],
    ["NOT exp", ""],
    ["- exp", "", { "prec": "UMINUS" }],
    ["exp_compare", ""],
    ["exp_calc", ""],
    ["exp_bin", ""],
    ["( exp )", ""],
    ["[ ]", ""],
    ["[ arrlist ]", ""],
    ["fn_call", ""],
  ],

  exp_compare: [
    ["exp NOT_EQ exp", ""],
    ["exp EQ_EQ exp", ""],
    ["exp GT_EQ exp", ""],
    ["exp LT_EQ exp", ""],
    ["exp > exp", ""],
    ["exp < exp", ""],
  ],

  exp_bin: [
    ["exp AND exp", ""],
    ["exp OR exp", ""],
  ],

  exp_calc: [
    ["exp + exp", ""],
    ["exp - exp", ""],
    ["exp * exp", ""],
    ["exp / exp", ""],
  ],

  fn_call: [
    ["pid ( )", ""],
    ["pid ( arrlist )", ""],
  ],

  arrlist: [
    ["exp", ""],
    ["arrlist , exp", ""],
    ["arrlist ,", ""],
  ],

  literal: [
    ["NUMBER", ""],
    ["NUMBER_HEX", ""],
    ["STRING_TRIPLE", ""],
    ["STRING_SINGLE", ""],
    ["STRING_HEX", ""],
    ["pid", ""],
  ],

  pid: [
    ["ID", ""],
    ["pid DOT ID", ""]
  ],

  str: [
    ["STRING_TRIPLE", ""],
    ["STRING_SINGLE", ""],
    ["STRING_HEX", ""],
  ],

}

let operators = [
  ["left", "AND", "OR"],
  ["left", ">", "<", "GT_EQ", "LT_EQ", "EQ_EQ", "NOT_EQ"],
  ["left", "+", "-"],
  ["left", "*", "/"],
  ["left", "UMINUS", "NOT"],
];

/* ETX

  build
  node parser/build.js && syntax-cli -m slr1 -g parser/build/etx.g -o parser/etxParser.js --loc

  语法验证
  node parser/build.js && syntax-cli -m slr1 -g parser/build/etx.g --validate

  不包含语法时的词法检查
  node parser/build.js && syntax-cli --lex parser/build/etx_lex.g --tokenize -f parser/test/etxTest.etx --loc

  包含语法时的词法检查
  node parser/build.js && syntax-cli -m slr1 -g parser/build/etx.g --tokenize -f parser/test/etxTest.etx --loc

  语法分析
  node parser/build.js && syntax-cli -m slr1 -g parser/build/etx.g -o parser/etxParser.js --loc && syntax-cli -m slr1 -g parser/build/etx.g -f parser/test/etxTest.etx --loc

*/

fs.writeFileSync(path.join(__dirname, 'build/etx_lex.g'), JSON.stringify(lex_etx, null, 4));
fs.writeFileSync(path.join(__dirname, 'build/etx.g'), JSON.stringify({lex: lex_etx, operators: operators, bnf: bnf_etx, moduleInclude: include_main}, null, 4));



/* EST

  build
  node parser/build.js && syntax-cli -m slr1 -g parser/build/etl.g -o parser/etlParser.js --loc

  语法验证
  node parser/build.js && syntax-cli -m slr1 -g parser/build/etl.g --validate

  不包含语法时的词法检查
  node parser/build.js && syntax-cli --lex parser/build/etl_lex.g --tokenize -f parser/test/etlTest.etl --loc

  包含语法时的词法检查
  node parser/build.js && syntax-cli -m slr1 -g parser/build/etl.g --tokenize -f parser/test/etlTest.etl --loc

  语法分析
  node parser/build.js && syntax-cli -m slr1 -g parser/build/etl.g -o parser/etlParser.js --loc && syntax-cli -m slr1 -g parser/build/etl.g -f parser/test/etlTest.etl --loc
*/

fs.writeFileSync(path.join(__dirname, 'build/etl_lex.g'), JSON.stringify(lex_main, null, 4));
fs.writeFileSync(path.join(__dirname, 'build/etl.g'), JSON.stringify({lex: lex_main, bnf: bnf_main, moduleInclude: include_main}, null, 4));


