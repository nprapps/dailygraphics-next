var chokidar = require("chokidar");
var fs = require("fs").promises;
var http = require("http");
var path = require("path");
var url = require("url");
var ws = require("ws");

module.exports = function(app) {
  var config = app.get("config");
  if (config.argv.liveReload === false) return;

  var server = new http.Server(async function(request, response) {
    if (url.parse(request.url).pathname == "/livereload.js") {
      var script = await fs.readFile("./server/static/livereload.js");
      response.writeHead(200, { "Content-Type": "text/javascript" });
      response.end(script);
    }
  });
  server.listen(config.argv.liveReload || 35729);

  var websocket = new ws.Server({ server });

  websocket.on("connection", function(socket) {
    // console.log("Livereload client connected");

    socket.on("message", function(message) {
      if (typeof message == "string") message = JSON.parse(message);
      switch (message.command) {
        case "hello":
          socket.send(JSON.stringify({
            command: "hello",
            protocols: [
              'http://livereload.com/protocols/official-7',
              'http://livereload.com/protocols/official-8',
              'http://livereload.com/protocols/official-9',
              'http://livereload.com/protocols/2.x-origin-version-negotiation',
              'http://livereload.com/protocols/2.x-remote-control'
            ],
            serverName: "dailygraphics-next"
          }));
        break;
      }
    });

    socket.on("error", err => console.log(`Livereload socket error: ${err.message}`));
    // socket.on("close", () => console.log("Livereload client disconnected"));

  });

  var timeout = null;
  var sendRefresh = function(file) {
    if (timeout) return;
    timeout = setTimeout(function() {
      timeout = null;
      var command = JSON.stringify({
        command: "reload",
        path: file,
        liveCSS: true
      });
      websocket.clients
        // .filter(client => client.readyState == ws.OPEN)
        .forEach(client => client.send(command));
    }, 200);
  };

  var paused = false;
  var onChange = function(file) {
    if (paused) return;
    console.log(`Changed: ${file}`);
    // todo - should we filter for specific extensions?
    // evict the cache
    var ext = path.extname(file).slice(1);
    var cache = app.get("cache").partition(ext);
    cache.clear();
    // tell clients about the reload (this is debounced)
    sendRefresh(file);
  };

  var watcher = chokidar.watch(config.root, {
    ignoreInitial: true,
    ignored: [/node_modules/, /fallback.png/, /.git/]
  });
  ["add", "change", "unlink"].forEach(e => watcher.on(e, onChange));

  var facade = {
    close: () => paused = true,
    reopen: () => paused = false
  };
  app.set("livereload", facade);

};
