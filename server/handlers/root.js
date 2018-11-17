var fs = require("fs").promises;
var path = require("path");

module.exports = async function(request, response) {

  var app = request.app;
  var config = app.get("config");

  var root = path.join(config.root);
  var graphics = await fs.readdir(root);
  graphics = graphics.filter(g => !g.match(/^[._]/));

  response.render("rootList.html", { graphics });

};