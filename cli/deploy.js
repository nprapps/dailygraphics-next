var deploy = require("../lib/deployGraphic");

module.exports = async function(config, argv, slugs) {
  for (var slug of slugs) {
    await deploy(config, slug);
  }
};
