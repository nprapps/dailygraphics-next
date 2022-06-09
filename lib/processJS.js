/*

Uses Rollup to load, transpile, and bundle JS files

*/

var path = require("path");
var fs = require("fs").promises;

var { rollup } = require("rollup");
var { nodeResolve } = require("@rollup/plugin-node-resolve");
var commonJS = require("@rollup/plugin-commonjs");
var { babel }  = require("@rollup/plugin-babel");

// text import plugin
var textExtensions = new Set([".svg", ".html", ".txt", ".glsl"]);
var importText = function() {
  return {
    name: "import-text",
    async load(id) {
      var extension = path.extname(id);
      if (!textExtensions.has(extension)) return null;
      var text = await fs.readFile(id, "utf-8");
      var code = "export default " + JSON.stringify(text);
      return { code };
    }
  }
};

module.exports = async function(sourceFile, options = {}) {
  var rolled = await rollup({
    input: sourceFile,
    external: ["fs"],
    plugins: [
      nodeResolve({
        rootDir: path.join(options.root, "node_modules"),
        browser: true
      }),
      importText(),
      commonJS({
        requireReturnsDefault: "auto"
      }),
      babel({
        targets: { browsers: ["safari >= 14"]},
        babelHelpers: "bundled",
        presets: [
          "@babel/preset-env",
        ]
      })
    ]
  });

  var { output } = await rolled.generate({
    name: "dailygraphics",
    format: "umd",
    sourcemap: "inline",//options.production ? true : "inline",
    interop: "default"
  });

  var bundle = output[0];

  rolled.close();

  return { src: bundle.code, map: bundle.map };
};
