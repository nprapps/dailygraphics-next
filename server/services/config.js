var path = require("path");

module.exports = function(config) {

  config.root = path.join(process.cwd(), config.path);

  return config;

}