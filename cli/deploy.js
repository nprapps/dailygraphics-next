var deploy = require("../lib/deployGraphic");

module.exports = async function(config, argv, slugs) {
  for (var slug of slugs) {
    try {
      slug = await completeSlug(config.root, slug);
      await deploy(config, slug);
    } catch (err) {
      console.error(err);
    }
  }
};
