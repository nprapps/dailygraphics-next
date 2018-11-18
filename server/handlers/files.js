var path = require("path");

module.exports = function(request, response) {
  var app = request.app;
  var config = app.get("config");

  response.sendFile(path.join(config.root, request.params[0]));
}