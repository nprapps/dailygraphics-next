var chalk = require("chalk");
var minimist = require("minimist");
var path = require("path");

var readJSON = require("../lib/readJSON");

var help = function() {
  console.log(`
Commands available from the command line:
  - ${chalk.blue("create TYPE SLUG [SHEET]")} - create a graphic named SLUG from the template TYPE. SHEET is optional.
  - ${chalk.blue("copy ORIGINAL SLUG")} - copy ORIGINAL into a new graphic named SLUG, with a new backing sheet
  - ${chalk.blue("deploy SLUG")} - deploy the chosen graphic to S3
  - ${chalk.blue("help")} - you're looking at it
  `);
};

var commands = {
  help,
  create: require("./create"),
  deploy: require("./deploy"),
  copy: require("./copy")
};

var run = async function() {
  var argv = minimist(process.argv);
  var [node, here, script = "help", ...positional] = argv._;

  var config = await readJSON("config.json");
  config.root = path.join(process.cwd(), config.graphicsPath);
  config.templateRoot = path.join(process.cwd(), config.templatePath);

  var command = commands[script];
  command(config, argv, positional);
};

run();
