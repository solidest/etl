
const fs = require("fs");
const path = require("path");
const parser = require("../parser");

let src_path = path.join(__dirname, 'etlTest.etl');
let asts = parser.getRunAstList(__dirname, src_path);
let ast = asts[0];

if(ast.script_etx) {
    fs.writeFileSync(path.join(__dirname, './etxTest.json'), JSON.stringify(ast.script_etx, null, 4));
} 

console.log('asts: ',asts.length);
console.log('buffer len: ', Buffer.from(JSON.stringify(asts)).length/1024/1024);


