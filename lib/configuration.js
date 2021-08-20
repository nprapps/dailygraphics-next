/*

Loads the config.json file and then augments it with extra information:

- sets the absolute paths for the graphics and template folders
- validates those paths
- loads a deployment config (S3 vs local)
- adds command line arguments to the config object

*/

var fs = require("fs").promises;
var readJSON = require("./readJSON");
var path = require("path");
var minimist = require("minimist");

var argv = minimist(process.argv);

var load = async function(configPath) {
  var config = await readJSON(configPath);

  config.root = path.join(process.cwd(), config.graphicsPath);
  config.templateRoot = path.join(process.cwd(), config.templatePath);

  // check for existence of these folders
  try {
    await fs.stat(config.root);
    await fs.stat(config.templateRoot);
  } catch (err) {
    console.log("Unable to load one of the source directories - check your paths in config.json!");
    console.log(`Folder does not exist: ${err.path}`);
    process.exit();
  }

  var deployTo = argv.deployTo || config.deployTo || "s3";
  var target = argv.target || "live";

  switch (deployTo) {
    case "s3":
      var s3 = config.s3[target] || config.s3;
      config.deployment = {
        type: "s3",
        ...s3
      };
    break;

    case "local":
      config.deployment = {
        type: "local",
        destination: config.exportPath
      }
    break;

    default:
      throw "Unable to create deployment config"
  }

  config.argv = { _: argv._ };
  for (var k in argv) {
    if (k == "_") continue;
    var upcase = k.replace(/-(\w)/g, (_, m) => m.toUpperCase());
    config.argv[upcase] = argv[k];
  }

  return config;
};

module.exports = { load }