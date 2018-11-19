module.exports = function(app) {
  app.set("processJS", require("../../lib/processJS"));
  app.set("processLESS", require("../../lib/processLESS"));
  app.set("processHTML", require("../../lib/processHTML"));
};