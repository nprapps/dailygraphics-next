/*

Uses Rollup to load, transpile, and bundle JS files

*/

var path = require("path");
var fs = require("fs").promises;

var { rollup } = require("rollup");
var { nodeResolve } = require("@rollup/plugin-node-resolve");
var commonJS = require("@rollup/plugin-commonjs");
var { babel }  = require("@rollup/plugin-babel");
var { dataToEsm } = require("@rollup/pluginutils");

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

// json import plugin
// adapted from https://github.com/rollup/plugins/tree/master/packages/json to support geojson
var json = function() {
  return {
    name: "json-and-geojson",
    transform(code, id) {
      if (!id.match(/json$/)) return null;
      try {
        const parsed = JSON.parse(code);
        return {
          code: dataToEsm(parsed, {
            compact: true
          }),
          map: { mappings: '' }
        };
      } catch (err) {
        const message = 'Could not parse JSON file';
        const position = parseInt(/[\d]/.exec(err.message)[0], 10);
        this.warn({ message, id, position });
        return null;
      }
    }
  }
}

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
      json({
        include: /json$/i,
        compact: true
      }),
      babel({
        targets: { browsers: ["safari >= 14"]},
        babelHelpers: "bundled",
        presets: [
          "@babel/preset-env",
        ]
      })
    ],
    onwarn: function (warning, warn) {
      if (warning.code === 'CIRCULAR_DEPENDENCY') return;
      warn(warning);
    }
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
