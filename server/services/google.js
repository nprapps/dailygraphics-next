module.exports = function(app) {
  var cache = app.get("cache");
  var sheetCache = cache.partition("sheets");
  var docCache = cache.partition("docs");
  var { getSheet, copySheet, testConnection } = require("../../lib/sheetOps");
  var { getDoc } = require("../../lib/docOps");

  var google = {
    drive: {
      copySheet,
      testConnection,
      getSheet: async function(sheet, options = {}) {
        var cached = null;
        if (!options.force) {
          var cached = sheetCache.getCloned(sheet);
          if (cached) {
            console.log(`Using cached copy for sheet ${sheet}`);
          }
        }
        var found = cached || (await getSheet(sheet));
        if (!cached) sheetCache.set(sheet, found);
        return found || {};
      },
      getDoc: async function(doc, options = {}) {
        var cached = null;
        if (!options.force) {
          var cached = docCache.getCloned(doc);
          if (cached) {
            console.log(`Using cached copy for doc ${doc}`);
          }
        }
        var found = cached || (await getDoc(doc));
        if (!cached) docCache.set(doc, found);
        return found || {};
      }
    },
    auth: require("../../lib/googleAuth")
  };

  app.set("google", google);
};
