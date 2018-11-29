var fs = require("fs").promises;
var path = require("path");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");
  var { deploy } = app.get("graphicOps");
  var { slug } = request.params;

  try {
    await deploy(config, slug);
    response.send({ success: true });
  } catch (error) {
    response.send({ error });
    console.log(error);
  }

}