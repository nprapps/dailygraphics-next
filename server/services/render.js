var fs = require("fs").promises;
var path = require("path");
var compile = require("lodash.template");
var cache = {};

var templatePath = path.join(process.cwd(), "server/templates");

module.exports = function(app) {

  var render = async function(path, data, callback) {
    var source = await fs.readFile(path, "utf-8");
    var template = compile(source);
    var rendered = template(data);
    callback(null, rendered);
  };

  app.set("views", process.cwd() + "/server/templates");
  app.engine("html", render);

};