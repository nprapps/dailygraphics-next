var path = require("path");
var qs = require("querystring");
var readJSON = require("../../lib/readJSON");
var expand = require("../../lib/expandMatch");

module.exports = async function(request, response) {
  var { app, user, query } = request;
  var config = app.get("config");
  var { getSheet } = app.get("google").sheets;

  var { slug } = request.params;
  var manifestPath = path.join(config.root, slug, "manifest.json");
  var manifest;
  manifest = (await readJSON(manifestPath)) || {};
  var { sheet } = manifest;

  var htmlFiles = await expand(path.join(config.root, slug), ".", ["*.html", "!_*.html"]);
  var children = htmlFiles.length > 1 ? htmlFiles.map(f => f.relative) : false;

  var data = {
    slug,
    sheet,
    config,
    children,
    deployed: false
  };

  if (sheet) {
    data.COPY = await getSheet(sheet, { force: !config.argv.forceSheetCache });
  }

  response.render("parentPage.html", data);
};
