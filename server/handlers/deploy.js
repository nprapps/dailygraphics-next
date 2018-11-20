var path = require("path");
var fs = require("fs").promises;

var deploy = require("../../lib/deployGraphic");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");
  var { slug } = request.params;

  try {
    await deploy(config, slug);
    response.send({ success: true });
  } catch (error) {
    response.send({ error });
  }

}