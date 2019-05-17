var fs = require("fs").promises;

module.exports = async function(path) {
  try {
    var contents = await fs.readFile(path, "utf-8");
    // JSON can contain comments
    contents = contents.replace(/\/\/.+$/gm, "");
    return JSON.parse(contents);
  } catch (err) {
    // file not found or bad JSON
    // prevents having to wrap this in try/catch in user code
    return null;
  }
};
