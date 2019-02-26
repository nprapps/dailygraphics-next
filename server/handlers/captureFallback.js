var path = require("path");
var puppetry = require("../../lib/puppetry");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");
  var port = app.get("port");
  var { slug } = request.params;
  var url = `http://localhost:${port}/graphic/${slug}/index.html`;
  var destination = path.join(config.root, slug, "fallback.png");

  var puppet = puppetry(config);

  try {
    console.log("Trying capture...");
    await puppet.snapGraphic(url, destination);
    console.log("Capture complete!")
    response.status(200);
    response.send();
  } catch (err) {
    console.log(err);
    response.status(500);
    response.send(err);
  }
}