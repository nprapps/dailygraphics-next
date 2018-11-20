var fs = require("fs").promises;
var path = require("path");
var copyDir = require("../../lib/copyDirectory");
var readJSON = require("../../lib/readJSON");

var { copySheet } = require("../../lib/sheetOps");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");

  var { template, slug } = request.body;
  var now = new Date();
  var dateSuffix = [now.getFullYear(), now.getMonth(), now.getDate()].join("");
  var fullSlug = slug + "-" + dateSuffix;
  var dest = path.join(config.root, fullSlug);

  var base = path.join(config.templateRoot, "_base");
  var src = path.join(config.templateRoot, template);

  try {
    await fs.mkdir(dest);
  } catch (err) {
    // should we complain if it exists?
  }
  await copyDir(base, dest);
  await copyDir(src, dest);

  // copy the sheet
  var manifestPath = path.join(dest, "manifest.json");
  var manifest = await readJSON(manifestPath);
  var { templateSheet } = manifest;

  var graphicsSheet = await copySheet(templateSheet, fullSlug, config.driveFolder);
  manifest.sheet = graphicsSheet.id;

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  response.status(302);
  response.set({
    "Location": `/graphic/${fullSlug}/`
  });
  response.send();

};