module.exports = function(app) {
  app.set("processHTML", require("../../lib/processHTML"));
  app.set("processJS", require("../../lib/processJS"));
  app.set("processLESS", require("../../lib/processLESS"));
};