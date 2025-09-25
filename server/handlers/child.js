var fs = require("fs").promises;
var path = require("path");
var processHTML = require("../../lib/processHTML");
var readJSON = require("../../lib/readJSON");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");

  var { getSheet, getDoc } = app.get("google").drive;
  var { loadCSV } = app.get("csv");
  var consoles = app.get("browserConsole");

  var { slug } = request.params;

  var manifestPath = path.join(config.root, slug, "manifest.json");
  var manifest = await readJSON(manifestPath);
  var { sheet, doc } = manifest;

  var data = {
    slug,
    config,
    COPY: {},
    TEXT: {},
    CSV: await loadCSV(slug)
  };

  if (sheet) {
    data.COPY = await getSheet(sheet);
  }

  if (doc) {
    data.TEXT = await getDoc(doc);
  }

  var basename = request.params[0] + ".html";
  var filename = basename;
  // check for aliases
  if (manifest.alias) {
    for (var k in manifest.alias) {
      var aliases = manifest.alias[k];
      if (aliases.includes(basename)) {
        filename = k;
      }
    }
  }
  var file = path.join(config.root, slug, filename);
  var output = "";
  try {
    output = await processHTML(file, data, { console: consoles, basename });
  } catch (err) {
    consoles.error(`EJS error at ${err.filename || basename}:${err.line}\n${err.message}`);
    output = `<h3>Error at ${err.filename || basename}:${err.line}</h3><pre style="white-space: pre-wrap">${err.message}</pre>`;
  }
  if (!(config.argv.liveReload === false)) {
    output += `<script src="http://localhost:${config.argv.liveReload || 35729}/livereload.js"></script>`;
  }

  response.send(output);
};
