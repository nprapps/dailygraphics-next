var browserify = require("browserify");
var babelify = require("babelify");

module.exports = function(app) {

  app.set("processJS", function(sourceFile) {
    return new Promise((ok, fail) => {
      var b = browserify({
        debug: process.NODE_ENV != "production"
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
  });
};