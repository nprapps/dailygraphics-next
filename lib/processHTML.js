/*

Processes HTML as EJS. Adds some template functions as `t`:

- include() - async function that loads and processes a template partial
- includeStatic() - async function that loads a partial (but doesn't process it)
- filters - collection of utility functions loaded from templateFilters.js

*/

var fs = require("fs").promises;
var path = require("path");
var mod = require("module");

var compile = require("./template");
var filters = require("./templateFilters");

var process = async function(file, data = {}, options = {}) {
  var parts = path.parse(file);

  // make a clean, non-mutated copy for templating
  data = JSON.parse(JSON.stringify(data));
  // allow setting a custom console for logging
  if (options.console) data.console = options.console;

  var t = Object.assign(
    {
      include: async function(file, d = data) {
        var f = path.join(parts.dir, file);
        return process(f, d);
      },
      includeStatic: async function(file) {
        var f = path.join(parts.dir, file);
        return fs.readFile(f, "utf-8");
      },
      process
    },
    filters
  );

  var source = await fs.readFile(file, "utf-8");
  var sourceURL = path.basename(file);
  var template = compile(source, { sourceURL });
  var localRequire = (mod.createRequire || mod.createRequireFromPath)(path.resolve(file));

  var d = Object.assign({}, data, {
    require: localRequire,
    __dirname: parts.dir,
    __filename: file,
    __basename: options.basename || parts.base,
    t, 
  });
  var rendered = await template(d);
  return rendered;
};

module.exports = process;
