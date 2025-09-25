/*

Templating code adapted liberally from lodash.template: https://github.com/lodash/lodash-node/blob/master/modern/string/template.js

What we changed:
* Line breaks are now reproduced in the compiled template, for easier debugging
* Template escapes are now inline, for the same reason.
* Added a wrapper that rethrows after logging out the line where errors occur
* Template function is async, so you'll need to await it or treat it as a promise

*/

var escape = require("lodash.escape");

var chalk = require("chalk");

/** Used to figure out how long the boilerplate is in the compiled template **/
var sentinel = "/**end prefx**/";

/** Used to match empty string literals in compiled template source. */
var reEmptyStringLeading = /\b__p \+= '';/g,
    reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
    reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

/** Used to match line breaks **/
var reLineBreak = /(\r?\n)/g;

/** Used to match [ES template delimiters](http://ecma-international.org/ecma-262/6.0/#sec-template-literal-lexical-components). */
var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;
var reInterpolate = /<%=([\s\S]+?)%>/g;

/** Used to ensure capturing order of template delimiters. */
var reNoMatch = /($^)/;

/** Used to match unescaped characters in compiled string literals. */
var reUnescapedString = /['\n\r\u2028\u2029\\]/g;

/** Used to escape characters for inclusion in compiled string literals. */
var stringEscapes = {
  '\\': '\\',
  "'": "'",
  '\u2028': 'u2028',
  '\u2029': 'u2029'
};

/**
 * Used by `_.template` to escape characters for inclusion in compiled string literals.
 *
 * @private
 * @param {string} chr The matched character to escape.
 * @returns {string} Returns the escaped character.
 */
var escapeStringChar = function(chr) {
  return '\\' + stringEscapes[chr];
}

var template = function(string, options) {
  // Based on John Resig's `tmpl` implementation (http://ejohn.org/blog/javascript-micro-templating/)
  // and Laura Doktorova's doT.js (https://github.com/olado/doT).
  var settings = {
    evaluate: /<%([\s\S]+?)%>/g,
    escape:/<%-([\s\S]+?)%>/g,
    interpolate: /<%=([\s\S]+?)%>/g,
    data: {}
  };

  options = options || {};
  options.imports = options.imports || {};
  options.imports._ = { escape };

  for (var key in settings) {
    if (!options[key]) options[key] = settings[key];
  }

  var isEscaping,
      isEvaluating,
      index = 0,
      prefixLength,
      interpolate = options.interpolate || reNoMatch,
      source = "__p += '";

  // Compile the regexp to match each delimiter.
  var reDelimiters = RegExp(
    (options.escape || reNoMatch).source + '|' +
    interpolate.source + '|' +
    (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
    (options.evaluate || reNoMatch).source + '|' +
    reLineBreak.source + '|$'
  , 'g');

  // Use a sourceURL for easier debugging.
  options.sourceURL = options.sourceURL || "<anonymous>";
  var sourceURL = '//# sourceURL=' + options.sourceURL + '\n';

  string.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, cr, offset) {
    interpolateValue || (interpolateValue = esTemplateValue);

    // Escape characters that can't be included in string literals.
    source += string.slice(index, offset).replace(reUnescapedString, escapeStringChar);

    // Replace delimiters with snippets.
    if (escapeValue) {
      isEscaping = true;
      source += "' + __e(" + escapeValue + ") + '";
    } else if (evaluateValue) {
      isEvaluating = true;
      source += "'; " + evaluateValue + "; __p += '";
    } else if (interpolateValue) {
      source += "' + ((__t = (" + interpolateValue + ")) == null ? '' : __t) + '";
    } else if (match.match(reLineBreak)) {
      source += "\\n';\n__p +='";
    }
    index = offset + match.length;

    // The JS engine embedded in Adobe products needs `match` returned in
    // order to produce the correct `offset` value.
    return match;
  });

  source = sentinel + source;
  source += "';\n";

  // If `variable` is not specified wrap a with-statement around the generated
  // code to add the data object to the top of the scope chain.
  var variable = options.variable;
  if (!variable) {
    source = 'with (obj) {\n' + source + '\n}\n';
  }

  // Frame code as the function body.
  source = 'async function(' + (variable || 'obj') + ') {' +
    (variable
      ? ''
      : 'obj || (obj = {});\n'
    ) +
    "var __t, __p = ''" +
    (isEscaping
       ? ', __e = _.escape'
       : ''
    ) +
    (isEvaluating
      ? ', __j = Array.prototype.join;\n' +
        "function print() { __p += __j.call(arguments, '') }\n"
      : ';'
    ) + 
    source + 
    'return __p; }';

  try {
    var keys = Object.keys(options.imports || []);
    var values = keys.map(function(k) { return options.imports[k] });
    var f = new Function(keys, sourceURL + 'return ' + source);
    var compiled = f.toString();
    var prefix = compiled.slice(0, compiled.indexOf(sentinel));
    var breaks = prefix.match(/(\n)/g);
    prefixLength = breaks ? breaks.length + 1 : 1;
    var result = f.apply(undefined, values);
  } catch(err) {
    throw new Error(`Couldn't compile ${options.sourceURL}: ("${err.message}")`, options.sourceURL);
  };

  // Provide the compiled function's source by its `toString` method or
  // the `source` property as a convenience for inlining compiled templates.
  result.source = string;

  var attempt = async function(data) {
    try {
      return await result(data);
    } catch (err) {
      var stack = err.stack;
      var match = stack.match(new RegExp(options.sourceURL + ":(\\d+)"));
      if (match) {
        var line = match[1] * 1 - prefixLength;
        // console.log(match[0], result.toString().indexOf("\n"));
        err.line = line;
        console.log(chalk.bgRed.white("Template execution error: %s:%s"), options.sourceURL, line + 1);
        var split = result.source.split("\n");
        for (var i = line > 0 ? line - 2 : 0; i < line + 3; i++) {
          console.log(chalk[i == line ? "red" : "cyan"](split[i]));
        }
        var lines = split.slice(line > 0 ? line - 2 : 0, line + 4).join("\n");
      }
      throw err;
    }
  }

  return attempt;
}

module.exports = template;