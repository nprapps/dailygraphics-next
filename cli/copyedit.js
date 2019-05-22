var fs = require("fs").promises;
var path = require("path");

var sheets = require("../lib/sheetOps");
var processHTML = require("../lib/processHTML");
var readJSON = require("../lib/readJSON");

module.exports = async function(config, argv, slugs) {
  var template = path.join(config.templatePath, "copyedit.html");
  config.user = await sheets.testConnection();
  for (var slug of slugs) {
    var manifest = await readJSON(path.join(config.graphicsPath, slug, "manifest.json"));
    var { sheet } = manifest;
    var COPY = await sheets.getSheet(sheet);
    var email = await processHTML(template, { sheet, slug, COPY, config })
    console.log(`
GRAPHIC FOR COPY EDIT: ${slug}
=============
${email}

`);
  }
}