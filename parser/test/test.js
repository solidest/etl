
const fs = require("fs");
const path = require("path");
const parser = require("../etlParser");
const helper = require("../helper");

let text = fs.readFileSync(path.join(__dirname, 'etlTest.etl'), "utf8");
let ast = parser.parse(text);
helper.getSingleLanguageText(text, ast);

for(let a of ast) {
    console.log(a.kind)
    if(a.kind==='block_etl') {
        fs.writeFileSync(path.join(__dirname, './etxTest.etx'), a.document);
    } else if(a.kind === 'block_lua') {
        fs.writeFileSync(path.join(__dirname, './etlTest.lua'), a.document);
    }
}

