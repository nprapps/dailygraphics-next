var less = require("less");
var fs = require("fs").promises;
var path = require("path");

module.exports = async function(file) {
  var dir = path.dirname(file);
  var source = await fs.readFile(file, "utf-8");
  var rendered = await less.render(source, {
    paths: [ dir ]
  });
  return rendered.css;
};