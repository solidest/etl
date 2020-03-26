
const fs = require("fs");
const path = require("path");
const helper = require("../parser");

let src_path = path.join(__dirname, 'etlTest.etl');
let asts = helper.getRunAstList(__dirname, src_path);
let ast = asts[0];

if(ast.script_etx) {
    fs.writeFileSync(path.join(__dirname, './etxTest.json'), JSON.stringify(ast.script_etx, null, 4));
} 

if(ast.script_lua) {
    fs.writeFileSync(path.join(__dirname, './etlTest.lua'), ast.script_lua);
}

console.log(ast);
console.log(asts.length);


