var fs = require("fs").promises;
var path = require("path");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");

  var file = path.join(config.root, request.params.slug, request.params[0]);

  // case sensitivity even on OS X
  var base = path.basename(file);
  var dir = path.dirname(file);
  var listing = await fs.readdir(dir);
  if (listing.indexOf(base) == -1) {
    response.status(404);
    return response.send();
  }

  response.sendFile(file);
};
