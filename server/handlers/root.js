var fs = require("fs").promises;
var path = require("path");

var getFolders = async function(dir) {
  var listing = await fs.readdir(dir);
  var matching = [];
  for (var entry of listing) {
    if (entry.match(/^[._]|node_modules/)) continue;
    var stat = await fs.stat(path.join(dir, entry));
    if (!stat.isDirectory()) continue;
    try {
      var manifest = await fs.stat(path.join(dir, entry, "manifest.json"));
      matching.push(entry);
    } catch (err) {
      console.log(`"${entry}" is missing manifest.json, not loaded`);
    }
  }
  return matching;
};

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");

  var graphics = await getFolders(config.root);
  var templates = await getFolders(config.templateRoot);

  response.render("rootList.html", { graphics, templates });
};
