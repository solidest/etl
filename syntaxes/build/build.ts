import fs = require('fs');
import path = require('path');
import yaml = require('js-yaml');

enum Language {
    Etl = "etl"
}

enum Extension {
    YamlEtl = "tmLanguage.yaml",
    JsonEtl = "tmLanguage.json",
}

function file(language: Language, extension: Extension) {
    return path.join(__dirname, '..', `${language}.${extension}`);
}


function readYaml(fileName: string) {
    const text = fs.readFileSync(fileName, "utf8");
    return yaml.safeLoad(text);
}

function transformGrammarRule(rule: any, propertyNames: string[], transformProperty: (ruleProperty: string) => string) {
    for (const propertyName of propertyNames) {
        const value = rule[propertyName];
        if (typeof value === 'string') {
            rule[propertyName] = transformProperty(value);
        }
    }

    for (var propertyName in rule) {
        const value = rule[propertyName];
        if (typeof value === 'object') {
            transformGrammarRule(value, propertyNames, transformProperty);
        }
    }
}

function transformGrammarRepository(grammar: TmGrammar, propertyNames: string[], transformProperty: (ruleProperty: string) => string) {
    const repository = grammar.repository;
    for (let key in repository) {
        transformGrammarRule(repository[key], propertyNames, transformProperty);
    }
}

function getTsGrammar(getVariables: (tsGrammarVariables: MapLike<string>) => MapLike<string>) {
    const tsGrammarBeforeTransformation = readYaml(file(Language.Etl, Extension.YamlEtl)) as TmGrammar;
    return updateGrammarVariables(tsGrammarBeforeTransformation, getVariables(tsGrammarBeforeTransformation.variables));
}

function replacePatternVariables(pattern: string, variableReplacers: VariableReplacer[]) {
    let result = pattern;
    for (const [variableName, value] of variableReplacers) {
        result = result.replace(variableName, value);
    }
    return result;
}

type VariableReplacer = [RegExp, string];
function updateGrammarVariables(grammar: TmGrammar, variables: MapLike<string>) {
    delete grammar.variables;
    const variableReplacers: VariableReplacer[] = [];
    for (const variableName in variables) {
        // Replace the pattern with earlier variables
        const pattern = replacePatternVariables(variables[variableName], variableReplacers);
        variableReplacers.push([new RegExp(`{{${variableName}}}`, "gim"), pattern]);
    }
    transformGrammarRepository(
        grammar,
        ["begin", "end", "match"],
        pattern => replacePatternVariables(pattern, variableReplacers)
    );
    return grammar;
}

function buildGrammar() {
    const tsGrammar = getTsGrammar(grammarVariables => grammarVariables);

    fs.writeFileSync(file(Language.Etl, Extension.JsonEtl), JSON.stringify(tsGrammar, null, 4));

}

buildGrammar();
