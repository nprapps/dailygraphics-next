var { completeSlug } = require("./util");

module.exports = async function(config, argv, slugs) {
  for (var slug of slugs) {
    try {
      slug = await completeSlug(config.root, slug)
    } catch (err) {
      // failed to complete
      console.log(err);
    }
  }
};
