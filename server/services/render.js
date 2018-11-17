var fs = require("fs").promises;
var path = require("path");
var t = require("lodash.template");
var cache = {};

var templatePath = path.join(process.cwd(), "server/templates");

var render = async function(path, data, callback) {
  if (!cache[path]) {
    var source = await fs.readFile(path, "utf-8");
    var compiled = t(source);
    cache[path] = compiled;
  }
  var rendered = cache[path](data);
  callback(null, rendered);
};

module.exports = { render };