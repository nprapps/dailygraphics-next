var fs = require("fs").promises;
var path = require("path");

var expandMatch = require("./expandMatch");
var processHTML = require("./processHTML");
var processJS = require("./processJS");
var processLESS = require("./processLESS");
var readJSON = require("./readJSON");
var s3 = require("./s3");
var sheetOps = require("./sheetOps");

var exporters = {
  s3: function(config) {
    return function(file, contents) {
      var { prefix, bucket } = config.deployment;
      var s3Path = path.posix.join(prefix, file);
      return s3.upload(bucket, s3Path, contents);
    };
  },
  local: function(config) {
    if (!config.exportPath) throw "No local export path configured - check `exportPath` in config.json";
    return async function(file, contents) {
      var exportPath = path.join(config.exportPath, file);
      var exportDir = path.dirname(exportPath);
      try {
        await fs.mkdir(exportDir, { recursive: true });
      } catch (err) {
        // directory already exists
      }
      console.log(`Writing local file to ${exportPath}...`)
      return fs.writeFile(exportPath, contents);
    }
  }
};

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
  // exclude synced files
  patterns.push("!**/synced/**/*");

  var exporter = (exporters[config.argv.deployTo || config.deployTo] || exporters.s3)(config);

  var handlers = {
    ".less": async function({ full, relative }) {
      relative = relative.replace(".less", ".css");
      var contents = await processLESS(full);
      var p = path.join(slug, relative);
      return exporter(p, contents);
    },
    ".js": async function({ full, relative }) {
      var { src, map } = await processJS(full, {
        production: true,
        root: config.root
      });
      // upload the main file
      var sourcePath = path.join(slug, relative);
      var sourceUpload = exporter(sourcePath, src);
      // upload the source map
      var mapPath = sourcePath + ".map";
      var mapUpload = exporter(mapPath, map);
      return Promise.all([sourceUpload, mapUpload]);
    },
    ".html": async function({ full, relative }) {
      var contents = await processHTML(full, { COPY, slug, config, sheet });
      var p = path.join(slug, relative);
      return exporter(p, contents);
    },
    default: async function({ full, relative }) {
      var contents = await fs.readFile(full);
      var p = path.join(slug, relative);
      return exporter(p, contents);
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
  var previewPath = path.join(slug, "preview.html");
  var stylesheet = await fs.readFile(path.join(process.cwd(), "server/static/style.css"), "utf-8");
  var htmlFiles = await expandMatch(path.join(config.root, slug), ".", ["*.html", "!_*.html"]);
  var children = htmlFiles.length > 1 ? htmlFiles.map(f => f.relative) : false;

  var previewData = {
    COPY,
    slug,
    config,
    sheet,
    stylesheet,
    children,
    deployed: true
  };
  var previewHTML = await processHTML(parent, previewData);
  await exporter(previewPath, previewHTML);
  console.log("Deploy complete!");
};
