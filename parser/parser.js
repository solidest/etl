const path = require("path");
const fs = require("fs");
const etlParser = require("./etlParser");
const etxParser = require("./etxParser");


//构建完整的 etl ast
function getEtlAst(proj_path, src_path, refs) {

  let src_apath = path.isAbsolute(src_path) ? src_path : path.resolve(src_path);
  let proj_apath = path.isAbsolute(proj_path) ? proj_path : path.resolve(proj_path);
  let src_rpath = path.relative(proj_apath, src_apath);

  let ast = {
    kind: 'etl',
    apath_src: src_apath,
    rpath_src: src_rpath,
    script_lua: null,
    script_etx: null,
  }

  let text = fs.readFileSync(src_apath, "utf8");
  let astlist = etlParser.parse(text);
  let newContent = text.split('\n').map(line => ' '.repeat(line.length)).join('\n');

  for (let a of astlist) {
    if (a.kind === 'block_etx' || a.kind === 'block_lua') {
      let script = newContent.slice(0, a.from) + text.slice(a.from, a.to) + newContent.slice(a.to);
      if (a.kind === 'block_lua') {
        ast.script_lua = script;
      } else if (a.kind === 'block_etx') {
        ast.script_etx = etxParser.parse(script);
      }
    }
  }

  getRefs(src_apath, astlist, refs);

  return ast;
}

//添加引用的文件到refs里
function getRefs(src_apath, astlist, refs) {
    let apath = path.dirname(src_apath);
    for (let a of astlist) {
    if (a.kind === 'block_lua') {
        if (a.refs) {
        for (let ref of a.refs) {
            try {
            refs.push(path.resolve(apath, ref))
            } catch (error) {
            console.log(error)
            }
        }
        }
    } else if (a.kind === 'using') {
        refs.push(path.resolve(apath, a.ref));
    }
    }
    console.log(refs)
    return refs;
}

//解析引用到的文件
function getRefAstList(proj_path, astlist, refs) {
  if (!refs || refs.length === 0) {
    return;
  }

  for (let apath_ref of refs) {
    let parsed = astlist.find(it => it.apath_src === apath_ref);
    if (parsed || !fs.existsSync(apath_ref)) {
      continue;
    }
    if (apath_ref.endsWith('.etl')) {
      getRunAstList(proj_path, apath_ref, astlist);
    } else if (apath_ref.endsWith('.lua')) {
      getRunLuaList(proj_path, apath_ref, astlist);
    }
  }
}

//构建执行 lua 的 ast
function getRunLuaList(proj_path, src_path, astlist) {

  let src_apath = path.isAbsolute(src_path) ? src_path : path.resolve(src_path);
  let proj_apath = path.isAbsolute(proj_path) ? proj_path : path.resolve(proj_path);
  let src_rpath = path.relative(proj_apath, src_apath);
  let text = fs.readFileSync(src_apath, "utf8");

  let ast = {
    kind: 'lua',
    apath_src: src_apath,
    rpath_src: src_rpath,
    script_lua: text
  }
  let asts = astlist || [];
  asts.push(ast);

  //解析引用
  let refs = [];
  getRefs(src_apath, etlParser.parse('<%lua\n' + text + '\n%>'), refs);
  getRefAstList(proj_path, asts, refs);
  return asts;
}

//构建完整的运行时ast
function getRunAstList(proj_path, src_path, astlist) {
  let refs = [];
  let ast = getEtlAst(proj_path, src_path, refs);
  let asts = astlist || [];
  asts.push(ast);
  getRefAstList(proj_path, asts, refs);
  return asts;
}

module.exports = {
  getRunAstList
};
