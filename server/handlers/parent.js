var path = require("path");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");
  var { readJSON } = app.get("fs");

  var { slug } = request.params;
  var manifestPath = path.join(config.root, slug, "manifest.json");
  var manifest;
  manifest = await readJSON(manifestPath) || {};
  var { sheet } = manifest;

  response.render("parentPage.html", { slug, sheet });

}