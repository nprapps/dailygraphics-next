var bodyparser = require("body-parser");
var express = require("express");
var fs = require("fs").promises;
var path = require("path");
var getAuthType = require("../lib/googleAuth").getAuthType;

var app = express();

module.exports = async function(config) {

  app.set("config", config);

  var port = config.argv.port || 8000;
  app.set("port", port);

  var server = app.listen(port);
  app.set("server", server);

  // load services onto app
  var services = await fs.readdir("server/services");
  services.forEach(s => {
    var initService = require(`./services/${s}`);
    initService(app);
  });

  app.use(express.static("server/static"));
  app.use(bodyparser.json());
  app.use(bodyparser.urlencoded({ extended: true }));

  // basic page loading
  app.get("/", require("./handlers/root"));
  app.get("/graphic/:slug/", require("./handlers/parent"));
  app.get("/graphic/:slug/*.html", require("./handlers/child"));
  app.get("/graphic/:slug/*.js", require("./handlers/bundle"));
  app.get("/graphic/:slug/*.css", require("./handlers/style"));

  // admin functions
  app.post("/graphic", require("./handlers/createGraphic"));
  app.post("/graphic/:slug/deploy", require("./handlers/deploy"));
  app.post("/graphic/:slug/captureFallback", require("./handlers/captureFallback"));
  app.post("/graphic/:original/duplicate", require("./handlers/duplicateGraphic"));

  // Google integration
  if (getAuthType() == "oauth") {
    app.get("/authorize", require("./handlers/googleOAuth").authorize);
    app.get("/authenticate", require("./handlers/googleOAuth").authenticate);
  }
  app.post("/graphic/:slug/refresh-sheet", require("./handlers/evictSheet"));

  // catch-all for static assets
  app.get("/graphic/:slug/*", require("./handlers/files"));

  console.log(`You got this! Open http://localhost:${port} in your browser to begin.`);
};
