var deploy = require("../lib/deployGraphic");

module.exports = async function(config, argv, [slug]) {
  await deploy(config, slug);
};
