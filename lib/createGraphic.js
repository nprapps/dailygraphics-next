/*

Creates a graphic from the template:

- generates the final slug and creates the folder
- copies the base files, then adds the template-specific files
- loads the manifest and creates a Google Sheet if requested
- takes a snapshot of the installed node_modules in the graphics folder for archiving purposes
- saves out the updated manifest

*/

var fs = require("fs").promises;
var path = require("path");

var copyDir = require("./copyDirectory");
var copySheet = require("./sheetOps").copySheet;
var readJSON = require("./readJSON");

module.exports = async function(config, template, slug, sheetID) {
  var now = new Date();
  var dateSuffix = [now.getFullYear(), now.getMonth() + 1, now.getDate()]
    .map(n => n.toString().padStart(2, "0"))
    .join("");
  var fullSlug = slug + "-" + dateSuffix;
  var dest = path.join(config.root, fullSlug);

  var base = path.join(config.templateRoot, "_base");
  var src = path.join(config.templateRoot, template);

  await fs.mkdir(dest);

  console.log(`Copying _base files for ${slug}...`);
  await copyDir(base, dest);
  console.log(`Copying ${template} files for ${slug}...`);
  await copyDir(src, dest);

  console.log("Creating graphic manifest...");
  // copy the sheet
  var manifestPath = path.join(dest, "manifest.json");
  var manifest = await readJSON(manifestPath);
  var { templateSheet, templateDoc } = manifest;

  if (templateSheet && sheetID == null) {
    console.log("Creating Google sheet...");
    try {
      var graphicsSheet = await copySheet(templateSheet, fullSlug, config.driveFolder);
      manifest.sheet = graphicsSheet.id;
    } catch (err) {
      console.log(`Unable to copy sheet ("${err.message}")`);
    }
  } else if (sheetID) {
    manifest.sheet = sheetID;
    console.log(`Using existing sheet ${sheetID}`);
  }

  if (templateDoc) {
    console.log("Creating Google doc...");
    try {
      var doc = await copySheet(templateDoc, fullSlug, config.driveFolder);
      manifest.doc = doc.id;
    } catch (err) {
      console.log(`Unable to copy document ("${err.message}")`);
    }
  }

  try {
    // snapshot the current global packages for the record, in case we upgrade later
    var package = await readJSON(path.join(config.root, "package.json"));
    manifest.installedPackagesAtCreation = Object.assign({}, package.dependencies, package.devDependencies || {});
  } catch (err) {
    console.log(
      "Couldn't make a snapshot of installed dependencies for the manifest -- does your graphics repo have a package.json?"
    );
    // it's fine if we can't snapshot these, because there's no package or
  }

  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`${fullSlug} created -- you got this!`);

  return fullSlug;
};
