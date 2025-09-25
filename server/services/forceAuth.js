var { testConnection } = require("../../lib/sheetOps");
var https = require("https");

var lastCheck = null;
var checkInterval = 5 * 60 * 1000; // five minute pause on connection tests

module.exports = function(app) {
  var config = app.get("config");

  var check = async function(request, response, next) {
    // in offline mode, just stub out the object and exit
    if (config.argv.offline) {
      console.log(`Google connection is not enforced in offline mode - some graphics may not load properly.`);
      return next();
    }
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
  app.use("/$", check);
  app.use("/graphic/:slug/$", check);
};
