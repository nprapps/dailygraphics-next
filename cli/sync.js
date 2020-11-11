var sync = require("../lib/syncAssets");

module.exports = async function(config, argv, slugs) {
  for (var slug of slugs) {
    await sync(config, slug);
  }
};