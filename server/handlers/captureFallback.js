var path = require("path");
var puppetry = require("../../lib/puppetry");
var readJSON = require("../../lib/readJSON");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");
  var port = app.get("port");
  var { slug } = request.params;
  var manifestPath = path.join(config.root, slug, "manifest.json");
  var manifest = (await readJSON(manifestPath)) || {};
  var page = manifest.fallbackPage || "index.html";
  var url = `http://localhost:${port}/graphic/${slug}/${page}`;
  var destination = path.join(config.root, slug, "fallback.png");

  var puppet = puppetry(config);

  if (config.argv.capture === false || config.capture === false) {
    console.log("Not capturing fallback...");
    response.status(200);
    response.send();
    return;
  }

  try {
    console.log("Trying capture...");
    await puppet.snapGraphic(url, destination);
    console.log("Capture complete!");
    response.status(200);
    response.send();
  } catch (err) {
    console.log(err);
    response.status(500);
    response.send(err);
  }
};
