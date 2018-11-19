var path = require("path");

var livereload = require("livereload");

module.exports = function(app) {

  var config = app.get("config")

  var server = livereload.createServer({
    extraExts: ["less"]
  });
  server.watch(config.root);

  app.set("livereload", server);

  var evictCache = function(file) {
    var ext = path.extname(file).slice(1)
    var cache = app.get("cache").partition(ext);
    cache.clear();
  };

  ["add", "change", "unlink"].forEach(e => server.watcher.on(e, evictCache));

}
