var browserify = require("browserify");
var babelify = require("babelify");
var path = require("path");

module.exports = function(sourceFile, options = {}) {
  return new Promise((ok, fail) => {
    var paths = [
      path.join(path.dirname(sourceFile), "node_modules"),
      path.join(options.root, "node_modules")
    ];
    var b = browserify({
      debug: !options.production,
      paths
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
    b.add(sourceFile);

    b.bundle(function(err, result) {
      if (err) return fail(err);
      ok(result.toString("utf-8"));
    });
  });
}