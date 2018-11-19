var ws = require("ws");

module.exports = function(app) {

  var http = app.get("server");
  var server = new ws.Server({ noServer: true });

  http.on("upgrade", function(request, socket, head) {
    server.handleUpgrade(request, socket, head, function(w) {
      server.emit("connection", w, request);
    });
  });

  var makeLogLevel = function(method) {
    return function(...args) {
      console.log(method.toUpperCase() + ": ", ...args);
      server.clients.forEach(client => {
        if (client.readyState == ws.OPEN) {
          client.send(JSON.stringify({ method, args }))
        }
      });
    };
  };

  var c = {
    log: makeLogLevel("log"),
    warn: makeLogLevel("warn"),
    error: makeLogLevel("error")
  };

  app.set("browserConsole", c);
};