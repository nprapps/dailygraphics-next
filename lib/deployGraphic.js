var fs = require("fs").promises;
var path = require("path");

var expandMatch = require("./expandMatch");
var processHTML = require("./processHTML");
var processJS = require("./processJS");
var processLESS = require("./processLESS");
var readJSON = require("./readJSON");
var s3 = require("./s3");
var sheetOps = require("./sheetOps");

module.exports = async function(config, slug) {
  var dir = path.join(config.root, slug);
  var manifestPath = path.join(dir, "manifest.json");
  var manifest = await readJSON(manifestPath);
  var { sheet, files: patterns } = manifest;

  var COPY = sheet ? await sheetOps.getSheet(sheet) : {};

  var matching = await expandMatch(dir, ".", patterns);
  for (var i = 0; i < matching.length; i++) {
    var { full, relative } = matching[i];
    var extension = path.extname(relative);
    var contents;
    switch (extension) {
      case ".less":
        // swap here, instead of in the file patterns
        relative = relative.replace(".less", ".css");
        contents = await processLESS(full);
        break;

      case ".js":
        contents = await processJS(full, { production: true, root: config.root });
        break;

      case ".html":
        contents = await processHTML(full, { COPY, slug });
        break;

      default:
        contents = await fs.readFile(full);
    }
    var s3Path = path.join(config.s3.prefix, slug, relative);
    var result = await s3.upload(config.s3.bucket, s3Path, contents);
  }
};