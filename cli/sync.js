var sync = require("../lib/syncAssets");
var { completeSlug } = require("./util");

module.exports = async function(config, argv, slugs) {
  for (var slug of slugs) {
    try {
      slug = await completeSlug(config.root, slug);
      await sync(config, slug);
    } catch (err) {
      console.log(err);
    }
  }
};

module.exports.command = "sync SLUGS [--push|--pull]";
module.exports.description = "sync assets for graphics with S3, push or pull to override the automatic reconciliation";