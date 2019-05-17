var fs = require("fs").promises;
var less = require("less");
var path = require("path");

module.exports = async function(file) {
  var dir = path.dirname(file);
  var basename = path.basename(file);
  var source = await fs.readFile(file, "utf-8");
  var rendered = await less.render(source, {
    paths: [dir],
    filename: basename
  });
  return rendered.css;
};
