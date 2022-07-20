var fs = require("fs").promises;
var path = require("path");
var readJSON = require("../../lib/readJSON");

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

var getMetadata = async function(data,dir) {
  var metadata = {};
  for (var i = 0; i < data.length; i++) {
    var manifest = await readJSON(path.join(dir, data[i], "manifest.json"));
    if (manifest.templateType) {
      var template = manifest.templateType;
    } else {
      var template = "";
    }

    if (manifest.parent) {
      var parent = manifest.parent;
    } else {
      var parent = [];
    }

    metadata[data[i]] = {
      "templateType":template,
      "parent":parent
    }
  }
  return metadata;
};


module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");

  var graphics = await getFolders(config.root);
  var templates = await getFolders(config.templateRoot);

  var graphicMetadata = await getMetadata(graphics,config.root)

  response.render("rootList.html", { graphics, templates, graphicMetadata });
};
