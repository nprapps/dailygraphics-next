module.exports = function(app) {

  var ops = {
    create: require("../../lib/createGraphic"),
    deploy: require("../../lib/deployGraphic")
  };

  app.set("graphicOps", ops);

}