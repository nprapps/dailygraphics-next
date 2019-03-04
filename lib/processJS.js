var babelify = require("babelify");
var browserify = require("browserify");
var exorcist = require("exorcist");
var flat = require("browser-pack-flat");
var path = require("path");
var shake = require("common-shakeify");
var stream = require("stream");
var uglifyify = require("uglifyify");

// a Bucket collects from a Stream.
var Bucket = function() {
  var chunks = [];
  this.stream = new stream.Writable({
    decodeStrings: false,
    write: (chunk, _, done) => {
      chunks.push(chunk);
      done();
    }
  });
  this.promise = new Promise((ok, fail) => {
    this.stream.on("finish", () => {
      ok(chunks.join(""));
    });
    this.stream.on("error", fail);
  });
};

module.exports = function(sourceFile, options = {}) {
  return new Promise(async (ok, fail) => {
    var paths = [
      path.join(path.dirname(sourceFile), "node_modules"),
      path.join(options.root, "node_modules")
    ];
    var b = browserify({
      debug: true,
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
    if (options.production) {
      b.transform(uglifyify, {
        global: true,
        mangle: false
      });
    }
    // Flat-packing currently disables tree-shaking, so we'll live with the module penalty for now
    // b.plugin(flat);
    b.plugin(shake);
    b.add(sourceFile);


    if (options.production) {
      // extract source map and make it available as a separate file

      var script = new Bucket();
      var sourcemap = new Bucket();

      b.bundle()
        .pipe(exorcist(sourcemap.stream, `./${path.basename(sourceFile)}.map`, null, path.dirname(sourceFile)))
        .pipe(script.stream);

      var [src, map] = await Promise.all([script.promise, sourcemap.promise]);
      ok({ src, map });
    } else {
      // in dev we just ship the map
      b.bundle(function(err, src) {
        if (err) return fail(err);
        src = src.toString("utf-8");
        ok({ src });
      });
    }

  });
}