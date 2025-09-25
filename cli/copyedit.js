var fs = require("fs").promises;
var path = require("path");

var sheets = require("../lib/sheetOps");
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
      var { sheet } = manifest;
      var COPY = await sheets.getSheet(sheet);
      var email = await processHTML(template, { sheet, slug, COPY, config })
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

module.exports.command = "copyedit SLUGS";
module.exports.description = "display the copy edit e-mail for the chosen SLUGS"