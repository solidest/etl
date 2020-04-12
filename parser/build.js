const fs = require("fs");
const path = require("path");

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
    ["as", "return 'AS'"],
    ["[a-zA-Z_][a-zA-Z0-9_]*", "return 'ID'"],
    ["<%lua", "this.pushState('lua'); return 'BLOCK_BEGIN_LUA'"],
    ["<%", "this.pushState('etl'); return 'BLOCK_BEGIN_ETL'"],
    [["lua", "etl"], "%>", "this.popState(); return 'BLOCK_END'"],
    [["*"], "\\n", "/*return 'NEWLINE'*/"],
    [["*"], ".", "/*return 'ANY_OTHER'*/"],
  ],
}

let bnf_main = {
  
  etl: [
    ["etl_element", "$$ = newList($etl_element)"],
    ["etl etl_element", "$$ = joinList($etl, $etl_element)"]
  ],

  etl_element: [
    ["USING str AS ID", "$$ = newUsing($str, $ID)"],
    ["block", "$$ = $block"],
  ],

  block: [
    ["BLOCK_BEGIN_LUA block_body BLOCK_END", "$$ = newBlock('block_lua', @1.startOffset+5, @3.endOffset-2);"],
    ["BLOCK_BEGIN_LUA BLOCK_END", "$$ = newBlock('block_lua', @1.startOffset+5, @2.endOffset-2);"],
    ["BLOCK_BEGIN_ETL block_body BLOCK_END", "$$ = newBlock('block_etx', @1.startOffset+2, @3.endOffset-2);"],
    ["BLOCK_BEGIN_ETL BLOCK_END", "$$ = newBlock('block_etx', @1.startOffset+2, @2.endOffset-2);"],
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

    function newUsing(str, id) {
      return { kind: 'using', ref: eval(str), pkg: id };
    }

    function newList(item) {
      return item ? [item] : [];
    }

    function joinList(list, item) {
      if(list && item) {
        list.push(item);
      }
      return list;
    }

    function getRef(str) {
      let s = eval(str);
      if(s && s.endsWith(".lua")) {
        return s;
      }
      return null;
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
    ["program", "return 'PROGRAM'"],
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
    ["top_element", "$$ = newList($top_element);"],
    ["top_element_list top_element", "$$ = joinList($top_element_list, $top_element);"]
  ],

  top_element: [
    ["PROTOCOL ID { }", "newElement('protocol', $ID, 'seglist', null, @ID);"],
    ["PROTOCOL ID { protocol_element_list }", "$$ = newElement('protocol', $ID,'seglist', $protocol_element_list, @ID);"],
    ["PROGRAM ID { }", ""],
    ["PROGRAM ID { program_element_list }", ""],
  ],

  // protocol
  protocol_element_list: [
    ["protocol_element", "$$ = newList($protocol_element);"],
    ["protocol_element_list protocol_element", "$$ = joinList($protocol_element_list, $protocol_element)"]
  ],

  protocol_element: [
    ["SEGMENT ID object_like", "$$ = newElement('segment', $ID, 'props', $object_like, @ID);"],
    ["segments", "$$ = $segments;"],
    ["branch", "$$ = $branch;"],
  ],

  segments: [
    ["SEGMENTS ID { }", "$$ = newProtSeggroup($ID, null, @ID);"],
    ["SEGMENTS ID { protocol_element_list }", "$$ = newProtSeggroup($ID, $protocol_element_list, @ID);"],
  ],

  branch: [
    ["WHEN ( exp ) { }", "$$ = newProtBranch('when', $exp, null, @exp);"],
    ["WHEN ( exp ) { protocol_element_list }", "$$ = newProtBranch('when', $exp, $protocol_element_list, @exp);"],
    ["ONEOF ( exp ) { }", "$$ = newProtBranch('oneof', $exp, null, @exp);"],
    ["ONEOF ( exp ) { protocol_element_list }", "$$ = newProtBranch('oneof', $exp, $protocol_element_list, @exp);"],
  ],

  // program
  program_element_list: [
    
  ],

  // common
  object_like: [
    ["{ }", "$$ = newList(null);"],
    ["{ property_list }", "$$ = $property_list;"],
  ],

  property_list: [
    ["property_setting", "$$ = newList($property_setting);"],
    ["property_list , property_setting", "$$ = joinList($property_list, $property_setting);"],
    ["property_list ,", "$$ = $property_list;"],
  ],

  property_setting: [
    ["ID : exp", "$$ = newProp($ID, $exp, @ID, @exp);"]
  ],

  exp: [
    ["literal", "$$ = $literal;"],
    ["object_like", "$$ = $object_like;"],
    ["NOT exp", "$$ = {kind: 'not', exp: $exp};"],
    ["- exp", "$$ = {kind: 'uminus', exp: $exp};", { "prec": "UMINUS" }],
    ["exp_compare", "$$ = $exp_compare;"],
    ["exp_calc", "$$ = $exp_calc;"],
    ["exp_bin", "$$ = $exp_bin;"],
    ["( exp )", "$$ = $exp;"],
    ["[ ]", "$$ = newKindList('array', null);"],
    ["[ arrlist ]", "$$ = $arrlist;"],
    ["fn_call", "$$ = $fn_call;"],
  ],

  exp_compare: [
    ["exp NOT_EQ exp", "$$ = {kind: 'not_eq', left: $1, right: $3};"],
    ["exp EQ_EQ exp", "$$ = {kind: 'eq_eq', left: $1, right: $3};"],
    ["exp GT_EQ exp", "$$ = {kind: 'gt_eq', left: $1, right: $3};"],
    ["exp LT_EQ exp", "$$ = {kind: 'lt_eq', left: $1, right: $3};"],
    ["exp > exp", "$$ = {kind: 'gt', left: $1, right: $3};"],
    ["exp < exp", "$$ = {kind: 'lt', left: $1, right: $3};"],
  ],

  exp_bin: [
    ["exp AND exp", "$$ = {kind: 'and', left: $1, right: $3};"],
    ["exp OR exp", "$$ = {kind: 'or', left: $1, right: $3};"],
  ],

  exp_calc: [
    ["exp + exp", "$$ = {kind: 'add', left: $1, right: $3};"],
    ["exp - exp", "$$ = {kind: 'subtract', left: $1, right: $3};"],
    ["exp * exp", "$$ = {kind: 'multiply', left: $1, right: $3};"],
    ["exp / exp", "$$ = {kind: 'divide', left: $1, right: $3};"],
  ],

  fn_call: [
    ["pid ( )", "$$ = {kind: 'fn_call', pname: $pid};"],
    ["pid ( arrlist )", "$$ = {kind: 'fn_call', pname: $pid, args: $arrlist};"],
  ],

  arrlist: [
    ["exp", "$$ = newKindList('array', $exp);"],
    ["arrlist , exp", "$$ = joinKindList($arrlist, $exp);"],
    ["arrlist ,", "$$ = $arrlist;"],
  ],

  literal: [
    ["NUMBER", "$$ = {kind: 'number', value: eval(yytext)};"],
    ["NUMBER_HEX", "$$ = {kind: 'number', value: eval(yytext)};"],
    ["str", "$$ = $str;"],
    ["pid", "$$ = $pid;"],
  ],

  pid: [
    ["ID", "$$ = newKindList('pid', $1);"],
    ["pid DOT ID", "$$ = joinKindList($pid, $ID);"]
  ],

  str: [
    ["STRING_TRIPLE", "$$ = {kind: 'string', value: eval(yytext)};"],
    ["STRING_SINGLE", "$$ = {kind: 'string', value: eval(yytext)};"],
    ["STRING_HEX", "$$ = {kind: 'strhex',  value: yytext};"],
  ],

}


let include_etx = `

    function newList(item) {
      if(item) {
        return [item];
      } else {
        return [];
      }
    }

    function joinList(list, item) {
      if(list && item) {
        list.push(item);
      }
      return list;
    }

    function newKindList(kind, item) {
      if(item) {
        return {kind: kind, list: [item]};
      } else {
        return {kind: kind, list: []};
      }
    }

    function joinKindList(list, item) {
      if(list && list.list && item) {
        list.list.push(item);
      }
      return list;
    }

    function newProp(id, exp, id_loc, exp_loc) {
      return {
        kind: 'prop',
        name: id,
        value: exp,
        name_from: id_loc.startOffset,
        name_to: id_loc.endOffset,
        value_from: exp_loc.startOffset,
        value_to: exp_loc.endOffset,
      }
    }

    function newProtBranch(kind, exp, seglist, exp_loc) {
      return {
        kind: kind,
        exp: exp,
        seglist: seglist,
        exp_from: exp_loc.startOffset,
        exp_to: exp_loc.endOffset,
      }
    }

    function newProtSeggroup(name, seglist, name_loc) {
      return {
        kind: 'seggroup',
        name: name,
        seglist: seglist,
        name_from: name_loc.startOffset,
        name_to: name_loc.endOffset,
      }
    }

    function newElement(kind, name, body_name, body, name_loc) {
      let res = {
        kind: kind,
        name: name,
        name_from: name_loc.startOffset,
        name_to: name_loc.endOffset,
      }
      res[body_name] = body;
      return res;
    }


`

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

fs.writeFileSync(path.join(__dirname, 'build/etl_lex.g'), JSON.stringify(lex_main, null, 4));
fs.writeFileSync(path.join(__dirname, 'build/etl.g'), JSON.stringify({lex: lex_main, bnf: bnf_main, moduleInclude: include_main}, null, 4));
fs.writeFileSync(path.join(__dirname, 'build/etx_lex.g'), JSON.stringify(lex_etx, null, 4));
fs.writeFileSync(path.join(__dirname, 'build/etx.g'), JSON.stringify({lex: lex_etx, operators: operators, bnf: bnf_etx, moduleInclude: include_etx}, null, 4));

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



