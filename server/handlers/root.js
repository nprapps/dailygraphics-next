var fs = require("fs").promises;
var path = require("path");

var getFolders = async function(dir) {
  var listing = await fs.readdir(dir);
  var matching = [];
  for (var i = 0; i < listing.length; i++) {
    var entry = listing[i];
    if (entry.match(/^[._]|node_modules/)) continue;
    var stat = await fs.stat(path.join(dir, entry));
    if (!stat.isDirectory()) continue;
    matching.push(entry);
  }
  return matching;
};

module.exports = async function(request, response) {

  var app = request.app;
  var config = app.get("config");

  var root = config.root;
  var graphics = await getFolders(root);

  var templateRoot = config.templateRoot = path.resolve(process.cwd(), config.templatePath);
  var templates = await getFolders(templateRoot);

  response.render("rootList.html", { graphics, templates });

};