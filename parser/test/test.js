
const fs = require("fs");
const path = require("path");
const parser = require("../etlParser");

let text = fs.readFileSync(path.join(__dirname, 'etlTest.etl'), "utf8");
let ast = parser.parse(text);

console.log(ast);