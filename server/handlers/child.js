var fs = require("fs").promises;
var path = require("path");
var processHTML = require("../../lib/processHTML");
var readJSON = require("../../lib/readJSON");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");

  var { getSheet, getDoc } = app.get("google").drive;
  var consoles = app.get("browserConsole");

  var { slug } = request.params;

  var manifestPath = path.join(config.root, slug, "manifest.json");
  var manifest = await readJSON(manifestPath);
  var { sheet, doc } = manifest;

  var data = {
    slug,
    config,
    COPY: {},
    TEXT: {}
  };

  if (sheet) {
    data.COPY = await getSheet(sheet);
  }

  if (doc) {
    data.TEXT = await getDoc(doc);
  }

  var basename = request.params[0] + ".html";
  var file = path.join(config.root, slug, basename);
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
