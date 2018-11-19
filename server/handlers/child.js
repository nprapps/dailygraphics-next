var path = require("path");
var fs = require("fs").promises;
var compile = require("lodash.template");

module.exports = async function(request, response) {

  var app = request.app;
  var config = app.get("config");

  var { slug } = request.params;

  var source = await fs.readFile(path.join(config.root, slug, "index.html"));
  var template = compile(source);
  var output = template({
    COPY: { labels: {}, data: [] }
  });
  output += `<script src="http://localhost:35729/livereload.js"></script>`;

  response.send(output);

};