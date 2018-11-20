var path = require("path");
var fs = require("fs").promises;

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");

  var { slug } = request.params;
  var { expandMatch, readJSON } = app.get("fs");
  var { upload } = app.get("s3");

  var processJS = app.get("processJS");
  var processLESS = app.get("processLESS");

  var dir = path.join(config.root, slug);
  var manifestPath = path.join(dir, "manifest.json");
  var manifest = await readJSON(manifestPath);
  var { files: patterns } = manifest;

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
        contents = await processJS(full);
        break;

      default:
        contents = await fs.readFile(full);
    }
    var s3Path = path.join(config.s3.prefix, slug, relative);
    var result = await upload(config.s3.bucket, s3Path, contents);
  }

  response.status(200);
  response.send();

}