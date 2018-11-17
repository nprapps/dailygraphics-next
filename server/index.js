var express = require("express");
var app = express();

var minimist = require("minimist");
var argv = minimist(process.argv);

module.exports = function(config) {

  app.set("config", config);

  app.set("views", process.cwd() + "/server/templates");
  app.engine("html", require("./services/render").render);

  app.get("/", require("./handlers/root"));
  app.get("/graphic/:slug", require("./handlers/graphic"));
  // app.get("/graphic/:slug/index.html", require("./handlers/child");
  // app.get("/graphic/:slug/*.js", require("./handlers/bundle"));
  // app.get("/graphic/:slug/*.css", require("./handlers/style"));
  // app.post("/graphic/:slug", require("./handlers/create"));
  // app.post("/graphic/:slug/deploy", require("./handlers/deploy"));
  // app.get("/graphic/:slug/copyedit", require("./handlers/copyedit"));
  // app.get("/graphic/:slug/refresh-sheet", require("./handlers/reloadData"));

  app.listen(argv.port || 8000);

};