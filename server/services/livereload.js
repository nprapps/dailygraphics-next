var path = require("path");

var livereload = require("livereload");

module.exports = function(app) {
  var config = app.get("config");
  if (config.argv.liveReload === false) return;

  var server = livereload.createServer({
    extraExts: ["less"],
    exclusions: [/node_modules\//, /fallback.png/],
    port: config.argv.liveReload
  });
  server.watch(config.root);

  app.set("livereload", server);

  var evictCache = function(file) {
    var ext = path.extname(file).slice(1);
    console.log(`Changed: ${file}\nEvicting cache for .${ext} files and triggering live reload...`);
    var cache = app.get("cache").partition(ext);
    cache.clear();
  };

  var bindServer = function() {
    ["add", "change", "unlink"].forEach(e => server.watcher.on(e, evictCache));
  };

  server.reopen = function() {
    server.watch(config.root);
    server.listen();
    bindServer();
  };

  bindServer();

};
