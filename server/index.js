var express = require("express");
var app = express();
var fs = require("fs").promises;
var path = require("path");

var minimist = require("minimist");
var argv = minimist(process.argv);

module.exports = async function(config) {

  config.root = path.join(process.cwd(), config.path);

  app.set("config", config);

  // load services onto app
  var services = await fs.readdir("server/services");
  services.forEach(s => {
    var initService = require(`./services/${s}`);
    initService(app);
  });

  app.use(express.static("server/static"));

  // basic page loading
  app.get("/", require("./handlers/root"));
  app.get("/graphic/:slug", require("./handlers/parent"));
  app.get("/graphic/:slug/index.html", require("./handlers/child"));
  app.get("/graphic/:slug/*.js", require("./handlers/bundle"));
  app.get("/graphic/:slug/*.css", require("./handlers/style"));

  // admin functions
  // app.post("/graphic/:slug", require("./handlers/create"));
  // app.post("/graphic/:slug/deploy", require("./handlers/deploy"));
  // app.get("/graphic/:slug/copyedit", require("./handlers/copyedit"));

  // Google integration
  // app.get("/authorize", require("./handlers/google-oauth").authorize);
  // app.get("/authenticated", require("./handlers/google-oath").authenticate);
  // app.get("/graphic/:slug/refresh-sheet", require("./handlers/reloadData"));

  // catch-all for static assets
  app.get("/graphic/:slug/*", require("./handlers/files"));

  app.listen(argv.port || 8000);

};