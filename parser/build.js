var fs = require("fs");
var path = require("path");

let lex_main = {
  startConditions: {
    etl: 1,
    lua: 1
  },
  rules: [
    [["etl"], "\\/\\*[^*]*\\*+([^\\/][^*]*\\*+)*\\/", "return 'COMMENT_BLOCK'" ],
    [["etl"], "\\/\\/[^\\r\\n]*", "return 'COMMENT_LINE'"],
    [["lua"], "--\\[\\[(.|\\r\\n|\\r|\\n)*\\]\\]", "return 'COMMENT_BLOCK'" ],
    [["lua"], "--[^\\n]*", "return 'COMMENT_LINE'"],
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
    ["etl_element", ""],
    ["etl etl_element", ""]
  ],

  etl_element: [
    ["USING str", ""],
    ["comment", ""],
    ["block", ""],
  ],

  block: [
    ["BLOCK_BEGIN_LUA block_body BLOCK_END"],
    ["BLOCK_BEGIN_ETL block_body BLOCK_END"],
  ],

  block_body: [
    ["body_line", ""],
    ["block_body body_line", ""]
  ],

  body_line: [
    ["comment", ""],
    ["str", ""]
  ],

  str: [
    ["STRING_TRIPLE", ""],
    ["STRING_SINGLE", ""],
  ],

  comment: [
    ["COMMENT_BLOCK", ""],
    ["COMMENT_LINE", ""],
  ],
}

//var text = fs.readFileSync(path.join(__dirname, 'etl.json'), "utf8");
fs.writeFileSync(path.join(__dirname, 'build/etl_lex.g'), JSON.stringify(lex_main, null, 4));

fs.writeFileSync(path.join(__dirname, 'build/etl.g'), JSON.stringify({lex: lex_main, bnf: bnf_main}, null, 4));


//build
//node parser/build.js && syntax-cli -m slr1 -g parser/build/etl.g -o parser/etlParser.js

//语法验证
//syntax-cli -m slr1 -g parser/build/etl.g --validate

//不包含语法时的词法检查
//syntax-cli --lex parser/build/etl_lex.g --tokenize -f parser/test/etlTest.etl 

//包含语法时的词法检查
//syntax-cli -m slr1 -g parser/build/etl.g --tokenize -f parser/test/etlTest.etl 

//语法分析
//syntax-cli -m slr1 -g parser/build/etl.g -f parser/test/etlTest.etl 

