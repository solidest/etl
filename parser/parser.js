const path = require("path");
const fs = require("fs");
const etlParser = require("./etlParser");
const etxParser = require("./etxParser");


//构建完整的 etl ast
function getEtlAst(proj_path, src_path, refs) {

  let src_apath = path.isAbsolute(src_path) ? src_path : path.resolve(src_path);
  let proj_apath = path.isAbsolute(proj_path) ? proj_path : path.resolve(proj_path);
  let src_rpath = path.relative(proj_apath, src_apath);

  if(src_rpath.startsWith('.')) {
    throw new Error(`无法解析文件"${src_path}"`);
  }

  let ast = {
    kind: 'etl',
    apath_src: src_apath,
    rpath_src: src_rpath,
    script_lua: null,
    script_etx: null,
  }

  let text = fs.readFileSync(src_apath, "utf8");
  let el_list = etlParser.parse(text);
  let newContent = text.split('\n').map(line => ' '.repeat(line.length)).join('\n');

  for (let a of el_list) {
    if (a.kind === 'block_etx' || a.kind === 'block_lua') {
      let script = newContent.slice(0, a.from) + text.slice(a.from, a.to) + newContent.slice(a.to);
      if (a.kind === 'block_lua') {
        ast.script_lua = script;
      } else if (a.kind === 'block_etx') {
        ast.script_etx = etxParser.parse(script);
      }
    } else if (a.kind === 'using') {  //添加引用的文件到refs里
      let adir = path.dirname(src_apath);
      refs.push(path.resolve(adir, a.ref));
    }
  }
  return ast;
}

//构建执行代码的 ast
function getSrcAst(kind, proj_path, src_path) {
  let src_apath = path.isAbsolute(src_path) ? src_path : path.resolve(src_path);
  let proj_apath = path.isAbsolute(proj_path) ? proj_path : path.resolve(proj_path);
  let src_rpath = path.relative(proj_apath, src_apath);
  if(src_rpath.startsWith('.')) {
    throw new Error(`无法解析文件"${src_path}"`);
  }

  let text = fs.readFileSync(src_apath, "utf8");
  return {
    kind: kind,
    apath_src: src_apath,
    rpath_src: src_rpath,
    script: text
  }
}

//构建so文件的 ast
function getBinAst(proj_path, src_path) {
  let src_apath = path.isAbsolute(src_path) ? src_path : path.resolve(src_path);
  let proj_apath = path.isAbsolute(proj_path) ? proj_path : path.resolve(proj_path);
  let src_rpath = path.relative(proj_apath, src_apath);
  if(src_rpath.startsWith('.')) {
    throw new Error(`无法解析文件"${src_path}"`);
  }

  let buf = fs.readFileSync(src_apath);
  return {
    kind: 'so',
    apath_src: src_apath,
    rpath_src: src_rpath,
    bin: buf.toString('base64')
  }
}

//循环解析所有引用到的文件
function getRefAstList(proj_path, asts, refs) {
  if (!refs || refs.length === 0) {
    return;
  }

  for (let apath_ref of refs) {
    let parsed = asts.find(it => it.apath_src === apath_ref);
    if (parsed || !fs.existsSync(apath_ref)) {
      continue;
    }
    let ext = path.extname(apath_ref);
    if (ext === '.etl') {
      getRunAstList(proj_path, apath_ref, asts);
    } else if(ext === '.lua' || ext === '.py') {
      let ast = getSrcAst(ext.substring(1), proj_path, apath_ref);
      asts.push(ast);
    } else if ( ext === '.so') {
      let ast = getBinAst(proj_path, apath_ref);
      asts.push(ast);
    }
  }
}


//构建完整的运行时ast
function getRunAstList(proj_path, src_path, asts) {
  let refs = [];
  let ast = getEtlAst(proj_path, src_path, refs);
  asts = asts || [];
  asts.push(ast);
  getRefAstList(proj_path, asts, refs);
  return asts;
}

module.exports = {
  getRunAstList
};
