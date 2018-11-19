var fs = require("fs").promises;

module.exports = async function(path) {
  var contents = await fs.readFile(path, "utf-8");
  return JSON.parse(contents);
};