var path = require("path");
var qs = require("querystring");
var readJSON = require("../../lib/readJSON");
var expand = require("../../lib/expandMatch");

module.exports = async function(request, response, next) {
  // force trailing slashes on graphics pages
  if (request.path[request.path.length - 1] != "/") {
    var qs = Object.keys(request.query).map(p => `${p}=${request.query[p]}`).join("&");
    if (qs) qs = "?" + qs;
    response.redirect(request.path + "/" + qs);
    return;
  }

  var { app, user, query } = request;
  var config = app.get("config");
  var { getSheet, getDoc } = app.get("google").drive;

  var { slug } = request.params;
  var manifestPath = path.join(config.root, slug, "manifest.json");
  var manifest;
  try {
    manifest = await readJSON(manifestPath);
  } catch (err) {
    return response.status(500).send(`Error: Unable to read manifest.json for ${slug}`);
  }
  var { sheet = false, doc = false} = manifest;

  var htmlFiles = await expand(path.join(config.root, slug), ".", ["*.html", "!_*.html"]);
  var nonIndex = htmlFiles.map(f => f.relative).filter(f => f != "index.html");
  var children = ["index.html", ...nonIndex];
  if (manifest.alias) {
    var aliased = Object.keys(manifest.alias).flatMap(k => manifest.alias[k]);
    children.push(...aliased);
  }

  var data = {
    slug,
    sheet,
    doc,
    config,
    children,
    deployed: false,
    COPY: {},
    TEXT: {}
  };

  if (sheet) {
    data.COPY = await getSheet(sheet, { force: !config.argv.forceSheetCache });
  }

  if (doc) {
    data.TEXT = await getDoc(doc, { force: !config.argv.forceSheetCache });
  }

  response.render("parentPage.html", data);
};
