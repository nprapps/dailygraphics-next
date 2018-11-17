var less = require("less");
var path = require("path");
var fs = require("fs").promises;

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");

  var { slug } = request.params;
  var filename = path.basename(request.path);
  filename = filename.replace(".css", ".less");
  var file = path.join(config.root, slug, filename);
  var source = await fs.readFile(file, "utf-8");
  var rendered = await less.render(source);

  response.set({
    "Content-Type": "text/css"
  });
  response.send(rendered.css);
};