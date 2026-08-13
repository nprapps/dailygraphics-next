var fs = require("fs").promises;
var path = require("path");

var sheets = require("../lib/sheetOps");
var docs = require("../lib/docOps");
var processHTML = require("../lib/processHTML");
var readJSON = require("../lib/readJSON");
var { completeSlug } = require("./util");
var expandMatch = require("../lib/expandMatch");


module.exports = async function(config, argv, slugs) {
  var template = path.join(config.templatePath, "copyedit-v2.html");
  config.user = await sheets.testConnection();
  for (var slug of slugs) {
    try {
      slug = await completeSlug(config.root, slug);
      var manifest = await readJSON(path.join(config.graphicsPath, slug, "manifest.json"));
      var { sheet, doc } = manifest;
      let COPY = {};
      let TEXT = {};

      if (sheet) {
        COPY = await sheets.getSheet(sheet);
      }
      if (doc) {
        TEXT = await docs.getDoc(doc);
      }

      var copyedit = null;

      // Look first to the spreadsheet for metadata info
      if (typeof COPY !== "undefined" && COPY.labels && COPY.metadata) {
        copyedit = {
          "source": "sheet",
          "data": COPY,
          "gdoc": sheet
        }
      }
      // But if a doc exists and has metadata, refer to that instead
      if (typeof TEXT !== "undefined" && TEXT.parsed && TEXT.parsed.metadata) {
        copyedit = {
          "source": "doc",
          "data": TEXT.parsed,
          "gdoc": doc
        }
      }

      //get children for copyedit template
      var htmlFiles = await expandMatch(path.join(config.root, slug), ".", ["*.html", "!_*.html"]);
      var nonIndex = htmlFiles.map(f => f.relative).filter(f => f != "index.html");
      var children = ["index.html", ...nonIndex];
      // add aliased children
      if (manifest.alias) {
        var aliased = Object.keys(manifest.alias).flatMap(k => manifest.alias[k]);
        children.push(...aliased);
      }

      var email = await processHTML(template, { sheet, slug, COPY, TEXT, copyedit, config, children })
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