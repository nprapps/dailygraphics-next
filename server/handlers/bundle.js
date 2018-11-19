var fs = require("fs").promises;
var path = require("path");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");
  var makeJS = app.get("processJS");

  var { slug } = request.params;
  var filename = path.basename(request.path);
  var sourceFile = path.join(config.root, slug, filename);

  try {
    var output = await makeJS(sourceFile);

    response.set({
      "Content-Type": "application/javascript"
    })
    response.send(output);
  } catch (err) {
    response.status(500);
    response.send(err.message);
    console.log(err.message);
  }
  

};