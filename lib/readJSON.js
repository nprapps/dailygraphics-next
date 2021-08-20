/*

Async loader for JSON files
Strips out single-line comments so that config files can be documented

*/

var fs = require("fs").promises;

module.exports = async function(path) {
  var contents = await fs.readFile(path, "utf-8");
  // JSON can contain comments
  contents = contents.replace(/\/\/.+$/gm, "");
  return JSON.parse(contents);
};
