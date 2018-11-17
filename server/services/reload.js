var path = require("path");

var livereload = require("livereload");

module.exports = function(config) {
  var server = livereload.createServer({
    extraExts: ["less"]
  });
  server.watch(config.root);
}
