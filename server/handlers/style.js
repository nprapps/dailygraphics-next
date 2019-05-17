var fs = require("fs").promises;
var path = require("path");
var makeCSS = require("../../lib/processLESS");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");

  var consoles = app.get("browserConsole");
  var lessCache = app.get("cache").partition("less");

  var { slug } = request.params;
  var filename = request.params[0] + ".less";
  var file = path.join(config.root, slug, filename);

  try {
    var cached = lessCache.get(file);
    var rendered = cached || (await makeCSS(file));

    response.set({
      "Content-Type": "text/css"
    });
    response.send(rendered);

    if (!cached) lessCache.set(file, rendered);
  } catch (err) {
    response.status(500);
    response.send(err.message);
    consoles.error(`${err.type} error: ${err.message} (${err.filename}:${err.line}:${err.column})`);
  }
};
