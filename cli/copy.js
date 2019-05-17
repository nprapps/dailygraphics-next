var duplicateGraphic = require("../lib/duplicateGraphic");

module.exports = async function(config, argv, [original, slug]) {
  console.log(`Making a copy of ${original}...`);
  await duplicateGraphic(config, original, slug);
};
