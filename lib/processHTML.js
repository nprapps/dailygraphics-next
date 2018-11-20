var compile = require("lodash.template");
var fs = require("fs").promises;

module.exports = async function(path, data) {
  var source = await fs.readFile(path, "utf-8");
  var template = compile(source);
  var rendered = template(data);
  return rendered;
}