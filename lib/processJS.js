var browserify = require("browserify");
var babelify = require("babelify");
var uglifyify = require("uglifyify");
var shake = require("common-shakeify");
var flat = require("browser-pack-flat");
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
          loose: true,
          modules: false
        }]
      ]
    });
    // b.transform(uglifyify, { global: true });
    b.plugin(shake);
    b.plugin(flat);
    b.add(sourceFile);

    b.bundle(function(err, result) {
      if (err) return fail(err);
      ok(result.toString("utf-8"));
    });
  });
}