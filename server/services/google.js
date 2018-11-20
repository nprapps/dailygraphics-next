module.exports = function(app) {
  var google = {
    sheets: require("../../lib/sheetOps"),
    auth: require("../../lib/googleAuth")
  }

  app.set("google", google);
}