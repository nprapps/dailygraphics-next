var duplicateGraphic = require("../lib/duplicateGraphic");

module.exports = async function(config, argv, [original, slug]) {
  console.log(`Making a copy of ${original}...`);
  await duplicateGraphic(config, original, slug);
};

module.exports.command = "copy ORIGINAL SLUG";
module.exports.description = "copy ORIGINAL into a new graphic named SLUG, with a new backing sheet";