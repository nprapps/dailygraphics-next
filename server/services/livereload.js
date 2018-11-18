var path = require("path");

var livereload = require("livereload");

module.exports = function(app) {

  var config = app.get("config")

  var server = livereload.createServer({
    extraExts: ["less"]
  });
  server.watch(config.root);

  app.set("livereload", server);

}
