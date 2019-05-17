var compile = require("lodash.template");
var path = require("path");

var processHTML = require("../../lib/processHTML");

var viewPath = path.join(process.cwd(), "server/templates");

module.exports = function(app) {
  var render = async function(path, data, callback) {
    var rendered = await processHTML(path, data);
    callback(null, rendered);
  };

  app.set("views", viewPath);
  app.engine("html", render);
};
