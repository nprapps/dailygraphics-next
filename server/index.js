var express = require("express");
var app = express();
var bodyparser = require("body-parser");
var fs = require("fs").promises;
var path = require("path");

var minimist = require("minimist");
var argv = minimist(process.argv);

var MemoryPalace = require("../lib/cache.js");

module.exports = async function(config) {

  config.root = path.join(process.cwd(), config.path);

  app.set("config", config);
  app.set("cache", new MemoryPalace());

  var server = app.listen(argv.port || 8000);
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
  app.get("/graphic/:slug/index.html", require("./handlers/child"));
  app.get("/graphic/:slug/*.js", require("./handlers/bundle"));
  app.get("/graphic/:slug/*.css", require("./handlers/style"));

  // admin functions
  app.post("/graphic", require("./handlers/createGraphic"));
  // app.post("/graphic/:slug/deploy", require("./handlers/deploy"));
  // app.get("/graphic/:slug/copyedit", require("./handlers/copyedit"));

  // Google integration
  // app.get("/authorize", require("./handlers/google-oauth").authorize);
  // app.get("/authenticated", require("./handlers/google-oath").authenticate);
  app.post("/graphic/:slug/refresh-sheet", require("./handlers/evictSheet"));

  // catch-all for static assets
  app.get("/graphic/:slug/*", require("./handlers/files"));

};