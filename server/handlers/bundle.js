var fs = require("fs").promises;
var path = require("path");
var makeJS = require("../../lib/processJS");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");
  var consoles = app.get("browserConsole");

  var { slug } = request.params;
  var filename = request.params[0] + ".js";
  var sourceFile = path.join(config.root, slug, filename);

  var jsCache = app.get("cache").partition("js");

  try {
    var cached = jsCache.get(sourceFile);
    if (!cached) {
      var made = await makeJS(sourceFile, { root: config.root });
      jsCache.set(sourceFile, made.src);
    }
    var output = cached || made.src;

    response.set({
      "Content-Type": "application/javascript"
    });
    response.send(output);
  } catch (err) {
    response.status(500);
    response.send(err.message);
    consoles.error(err.message);
  }
};
