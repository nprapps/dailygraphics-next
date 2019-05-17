module.exports = function(app) {
  var sheetCache = app.get("cache").partition("sheets");
  var { getSheet, copySheet, testConnection } = require("../../lib/sheetOps");

  var google = {
    sheets: {
      copySheet,
      testConnection,
      getSheet: async function(sheet, options = {}) {
        var cached = null;
        if (!options.force) {
          var cached = sheetCache.get(sheet);
          if (cached) console.log(`Using cached copy for sheet ${sheet}`);
        }
        var found = cached || (await getSheet(sheet));
        sheetCache.set(sheet, found);
        return found;
      }
    },
    auth: require("../../lib/googleAuth")
  };

  app.set("google", google);
};
