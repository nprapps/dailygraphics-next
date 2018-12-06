var path = require("path");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");
  var port = app.get("port");
  var { slug } = request.params;
  var puppetry = app.get("puppetry");
  var url = `localhost:${port}/graphic/${slug}/index.html`;
  var destination = path.join(config.root, slug, "fallback.png");

  try {
    console.log("trying capture");
    await puppetry.snapGraphic(url, destination);
    response.status(200);
    response.send();
  } catch (err) {
    console.log(err);
    response.status(500);
    response.send(err);
  }
}