var fs = require("fs").promises;

module.exports = async function(path) {
  var contents = await fs.readFile(path, "utf-8");
  // JSON can contain comments
  contents = contents.replace(/\/\/.+$/gm, "");
  return JSON.parse(contents);
};
