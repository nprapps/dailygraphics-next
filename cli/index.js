var chalk = require("chalk");
var minimist = require("minimist");
var path = require("path");

var configuration = require("../lib/configuration");


var help = function() {
  var helpable = Object.keys(commands).filter(c => commands[c].command)
  var list = helpable.map(c => 
    `${chalk.blue(commands[c].command)} - ${commands[c].description}`);
  console.log(`
Commands available from the command line:
${list.join("\n")}

[BRACES] signal optional arguments.`);
};

var commands = {
  help,
  create: require("./create"),
  deploy: require("./deploy"),
  copy: require("./copy"),
  copyedit: require("./copyedit"),
  sync: require("./sync"),
  "try": require("./try")
};

var run = async function() {
  var argv = minimist(process.argv);
  var [node, here, script = "help", ...positional] = argv._;

  var config = await configuration.load("config.json");

  if (!(script in commands)) script = "help";

  var command = commands[script];
  command(config, argv, positional);
};

run();
