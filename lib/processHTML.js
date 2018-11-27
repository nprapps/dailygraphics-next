var compile = require("./template");
var fs = require("fs").promises;
var path = require("path");
var filters = require("./templateFilters");

var process = async function(file, data = {}) {
  var dir = path.dirname(file);

  var t = Object.assign({
    include: async function(file, d = data) {
      var f = path.join(dir, file);
      return await process(f, d);
    }
  }, filters);
  
  var source = await fs.readFile(file, "utf-8");
  var template = compile(source);
  var d = Object.assign({}, data, { t });
  var rendered = await template(d);
  return rendered;
};

module.exports = process;