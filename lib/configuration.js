var readJSON = require("./readJSON");
var path = require("path");
var minimist = require("minimist");

var argv = minimist(process.argv);

var load = async function(configPath) {
  var config = await readJSON(configPath);

  config.root = path.join(process.cwd(), config.graphicsPath);
  config.templateRoot = path.join(process.cwd(), config.templatePath);
  config.argv = { _: argv._ };
  for (var k in argv) {
    if (k == "_") continue;
    var upcase = k.replace(/-(\w)/g, (_, m) => m.toUpperCase());
    config.argv[upcase] = argv[k];
  }

  return config;
};

module.exports = { load }