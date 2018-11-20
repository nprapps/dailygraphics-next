var path = require("path");
var fs = require("fs").promises;
var compile = require("lodash.template");

module.exports = async function(request, response) {

  var app = request.app;
  var config = app.get("config");
  var sheetCache = app.get("cache").partition("sheets");

  var { readJSON } = app.get("fs");
  var { getSheet } = app.get("google").sheets;

  var { slug } = request.params;

  var manifestPath = path.join(config.root, slug, "manifest.json");
  var manifest = await readJSON(manifestPath);
  var { sheet } = manifest;

  var data = {
    slug,
    COPY: {}
  };

  if (sheet) {
    var cached = sheetCache.get(sheet);
    if (cached) console.log(`Using cached copy for sheet ${sheet}`);
    data.COPY = cached || await getSheet(sheet);
    if (!cached) sheetCache.set(sheet, data.COPY);
  };

  var source = await fs.readFile(path.join(config.root, slug, "index.html"));
  var template = compile(source);
  var output = template(data);
  output += `<script src="http://localhost:35729/livereload.js"></script>`;

  response.send(output);

};