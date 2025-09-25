var fs = require("fs").promises;
var path = require("path");

var sheets = require("../lib/sheetOps");
var docs = require("../lib/docOps");
var processHTML = require("../lib/processHTML");
var readJSON = require("../lib/readJSON");
var { completeSlug } = require("./util");

module.exports = async function(config, argv, slugs) {
  var template = path.join(config.templatePath, "copyedit.html");
  config.user = await sheets.testConnection();
  for (var slug of slugs) {
    try {
      slug = await completeSlug(config.root, slug);
      var manifest = await readJSON(path.join(config.graphicsPath, slug, "manifest.json"));
      var { sheet, doc } = manifest;
      var COPY = await sheets.getSheet(sheet);
      var TEXT = await docs.getDoc(doc);
      var email = await processHTML(template, { sheet, slug, COPY, TEXT, config })
      console.log(`
GRAPHIC FOR COPY EDIT: ${slug}
=============
${email}
`);
    } catch (err) {
      console.log(err);
    }
  }
}