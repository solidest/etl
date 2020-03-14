"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var yaml = require("js-yaml");
var Language;
(function (Language) {
    Language["Etl"] = "etl";
})(Language || (Language = {}));
var Extension;
(function (Extension) {
    Extension["YamlEtl"] = "tmLanguage.yaml";
    Extension["JsonEtl"] = "tmLanguage.json";
})(Extension || (Extension = {}));
function file(language, extension) {
    return path.join(__dirname, '..', language + "." + extension);
}
function readYaml(fileName) {
    var text = fs.readFileSync(fileName, "utf8");
    return yaml.safeLoad(text);
}
function transformGrammarRule(rule, propertyNames, transformProperty) {
    for (var _i = 0, propertyNames_1 = propertyNames; _i < propertyNames_1.length; _i++) {
        var propertyName_1 = propertyNames_1[_i];
        var value = rule[propertyName_1];
        if (typeof value === 'string') {
            rule[propertyName_1] = transformProperty(value);
        }
    }
    for (var propertyName in rule) {
        var value = rule[propertyName];
        if (typeof value === 'object') {
            transformGrammarRule(value, propertyNames, transformProperty);
        }
    }
}
function transformGrammarRepository(grammar, propertyNames, transformProperty) {
    var repository = grammar.repository;
    for (var key in repository) {
        transformGrammarRule(repository[key], propertyNames, transformProperty);
    }
}
function getTsGrammar(getVariables) {
    var tsGrammarBeforeTransformation = readYaml(file(Language.Etl, Extension.YamlEtl));
    return updateGrammarVariables(tsGrammarBeforeTransformation, getVariables(tsGrammarBeforeTransformation.variables));
}
function replacePatternVariables(pattern, variableReplacers) {
    var result = pattern;
    for (var _i = 0, variableReplacers_1 = variableReplacers; _i < variableReplacers_1.length; _i++) {
        var _a = variableReplacers_1[_i], variableName = _a[0], value = _a[1];
        result = result.replace(variableName, value);
    }
    return result;
}
function updateGrammarVariables(grammar, variables) {
    delete grammar.variables;
    var variableReplacers = [];
    for (var variableName in variables) {
        // Replace the pattern with earlier variables
        var pattern = replacePatternVariables(variables[variableName], variableReplacers);
        variableReplacers.push([new RegExp("{{" + variableName + "}}", "gim"), pattern]);
    }
    transformGrammarRepository(grammar, ["begin", "end", "match"], function (pattern) { return replacePatternVariables(pattern, variableReplacers); });
    return grammar;
}
function buildGrammar() {
    var tsGrammar = getTsGrammar(function (grammarVariables) { return grammarVariables; });
    fs.writeFileSync(file(Language.Etl, Extension.JsonEtl), JSON.stringify(tsGrammar, null, 4));
}
buildGrammar();
