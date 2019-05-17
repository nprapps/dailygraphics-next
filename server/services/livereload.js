var path = require("path");

var livereload = require("livereload");

module.exports = function(app) {
  var config = app.get("config");
  if (config.argv.liveReload === false) return;

  var server = livereload.createServer({
    extraExts: ["less"],
    exclusions: [/node_modules\//],
    port: config.argv.liveReload
  });
  server.watch(config.root);

  app.set("livereload", server);

  var evictCache = function(file) {
    var ext = path.extname(file).slice(1);
    var cache = app.get("cache").partition(ext);
    cache.clear();
  };

  ["add", "change", "unlink"].forEach(e => server.watcher.on(e, evictCache));
};
