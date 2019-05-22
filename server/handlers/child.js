var fs = require("fs").promises;
var path = require("path");
var processHTML = require("../../lib/processHTML");
var readJSON = require("../../lib/readJSON");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");

  var { getSheet } = app.get("google").sheets;
  var consoles = app.get("browserConsole");

  var { slug } = request.params;

  var manifestPath = path.join(config.root, slug, "manifest.json");
  var manifest = await readJSON(manifestPath);
  var { sheet } = manifest;

  var data = {
    slug,
    config,
    COPY: {}
  };

  if (sheet) {
    data.COPY = await getSheet(sheet);
  }

  var file = path.join(config.root, slug, "index.html");
  var output = "";
  try {
    output = await processHTML(file, data);
  } catch (err) {
    consoles.error(`Error in ${err.filename}: ${err.message}`);
    output = "";
  }
  if (!(config.argv.liveReload === false)) {
    output += `<script src="http://localhost:${config.argv.liveReload || 35729}/livereload.js"></script>`;
  }

  response.send(output);
};
