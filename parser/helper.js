

function getSingleLanguageText(text, ast) {
    let newContent = text
    .split('\n')
    .map(line => ' '.repeat(line.length))
    .join('\n');

    for(let a of ast) {
        if(a.kind==='block_etl' || a.kind === 'block_lua') {
            a.document = newContent.slice(0, a.from) + text.slice(a.from, a.to) + newContent.slice(a.to);
        }
    }
}

module.exports = {getSingleLanguageText};