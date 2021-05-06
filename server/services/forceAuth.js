var { testConnection } = require("../../lib/sheetOps");
var https = require("https");

var lastCheck = null;
var checkInterval = 5 * 60 * 1000; // five minute pause on connection tests

module.exports = function(app) {
  var check = async function(request, response, next) {
    var app = request.app;
    var config = app.get("config");
    var now = Date.now();
    if (lastCheck && now - lastCheck < checkInterval) {
      request.user = config.user;
      return next();
    }
    lastCheck = now;
    try {
      // this will throw if user isn't logged in
      config.user = request.user = await testConnection();
      next();
    } catch (err) {
      console.log(`Unable to authorize Google connection ("${err.message}")`);
      // not connected, reroute to auth
      console.log("Redirecting to authorization page");
      response.status(302);
      response.set("Location", "/authorize");
      response.send();
    }
  };

  // test on individual graphics
  app.use("/graphic/:slug/$", check);
};
