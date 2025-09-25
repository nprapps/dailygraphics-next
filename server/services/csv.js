var loadCSV = require("../../lib/loadCSV");

module.exports = function(app) {

  var config = app.get("config");

  var csv = {
    loadCSV: async function(slug) {
      var cache = app.get("cache").partition("csv");
      var data = cache.getCloned(slug);
      if (!data) {
        data = await loadCSV(config, slug);
        cache.set(slug, data);
      }
      return data || {};
    }
  }

  app.set("csv", csv);

}