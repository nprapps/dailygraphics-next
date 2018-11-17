var fs = require("fs").promises;
var path = require("path");
var browserify = require("browserify");
var babelify = require("babelify");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");
  var env = app.get("env");

  var { slug } = request.params;
  var filename = path.basename(request.path);
  var b = browserify({
    debug: env != "production"
  });
  b.transform(babelify, {
    global: true,
    presets: [
      ["@babel/preset-env", {
        targets: { browsers: ["safari >= 11"] },
        loose: true
      }]
    ]
  });
  var sourceFile = path.join(config.root, slug, filename);
  b.add(sourceFile);

  var assembly = b.bundle();
  assembly.pipe(response);

  assembly.on("error", err => console.log("Compile error: " + err.message));

};