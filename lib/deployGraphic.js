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
  var { sheet } = manifest;
  var patterns = manifest.files || [
    "index.html",
    "graphic.js",
    "graphic.less",
    "*.png",
    "*.jpg",
    "*.json",
    "!manifest.json",
    "*.geojson",
    "*.csv"
  ];

  var handlers = {
    ".less": async function({ full, relative }) {
      relative = relative.replace(".less", ".css");
      var contents = await processLESS(full);
      var s3Path = path.join(config.s3.prefix, slug, relative);
      return s3.upload(config.s3.bucket, s3Path, contents);
    },
    ".js": async function({ full, relative }) {
      var { src, map } = await processJS(full, {
        production: true,
        root: config.root
      });
      // upload the main file
      var sourcePath = path.join(config.s3.prefix, slug, relative);
      var sourceUpload = s3.upload(config.s3.bucket, sourcePath, src);
      // upload the source map
      var mapPath = sourcePath + ".map";
      var mapUpload = s3.upload(config.s3.bucket, mapPath, map);
      return Promise.all([sourceUpload, mapUpload]);
    },
    ".html": async function({ full, relative }) {
      var contents = await processHTML(full, { COPY, slug, config, sheet });
      var s3Path = path.join(config.s3.prefix, slug, relative);
      return s3.upload(config.s3.bucket, s3Path, contents);
    },
    default: async function({ full, relative }) {
      var contents = await fs.readFile(full);
      var s3Path = path.join(config.s3.prefix, slug, relative);
      return s3.upload(config.s3.bucket, s3Path, contents);
    }
  };

  var COPY = sheet ? await sheetOps.getSheet(sheet) : {};

  var matching = await expandMatch(dir, ".", patterns);
  var uploads = matching.map(m => {
    var ext = path.extname(m.relative);
    var handler = handlers[ext] || handlers.default;
    return handler(m);
  });

  await Promise.all(uploads);

  // add the preview page in production
  var parent = path.join(process.cwd(), "server/templates/parentPage.html");
  var previewPath = path.join(config.s3.prefix, slug, "preview.html");
  var stylesheet = await fs.readFile(path.join(process.cwd(), "server/static/style.css"), "utf-8");
  var embedPath = path.join(config.templateRoot, "embed.html");
  var copyeditPath = path.join(config.templateRoot, "copyedit.html");
  var directLinkPath = path.join(config.templateRoot, "link.html");
  var previewData = {
    embedPath,
    copyeditPath,
    directLinkPath,
    COPY,
    slug,
    config,
    sheet,
    stylesheet,
    queryParams: "",
    deployed: true
  };
  var previewHTML = await processHTML(parent, previewData);
  await s3.upload(config.s3.bucket, previewPath, previewHTML);
  console.log("Deploy complete!");
};
