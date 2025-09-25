/*

Makes a copy of a graphic, including a copy of the Google Sheet in its manifest

*/

var fs = require("fs").promises;
var path = require("path");

var copyDir = require("./copyDirectory");
var readJSON = require("./readJSON");
var { copySheet, clearSheet } = require("./sheetOps");

module.exports = async function(config, original, slug) {
  var now = new Date();
  var dateSuffix = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map(n => n.toString().padStart(2, "0"))
    .join("");
  var fullSlug = slug + "-" + dateSuffix;
  var src = path.join(config.root, original);
  var dest = path.join(config.root, fullSlug);
  console.log(src, dest);

  await fs.mkdir(dest);

  console.log("Copying files...");
  await copyDir(src, dest);

  console.log("Loading manifest");
  var manifestPath = path.join(dest, "manifest.json");
  var manifest = await readJSON(manifestPath);
  var { sheet, doc } = manifest;

  if (sheet) {
    console.log("Duplicating existing sheet");
    try {
      var duplicateSheet = await copySheet(sheet, fullSlug, config.driveFolder);
      manifest.sheet = duplicateSheet.id;
      await clearSheet(duplicateSheet.id, "metadata!B2:B");
    } catch (err) {
      console.log(`Unable to make a copy of ${sheet}: "${err.message}"`);
    }
  }

  if (doc) {
    console.log("Duplicating existing Google Doc");
    try {
      var duplicateDoc = await copySheet(doc, fullSlug, config.driveFolder);
      manifest.doc = duplicateDoc.id;
    } catch (err) {
      console.log(`Unable to make a copy of ${doc}: "${err.message}"`);
    }
  }
  
  manifest.duplicatedFrom = original;

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
  console.log(`Duplicate of ${original} created as ${fullSlug} -- you got this!`);

  return fullSlug;
};
