var { testConnection } = require("../../lib/sheetOps");

module.exports = function(app) {
  var check = async function(request, response, next) {
    try {
      // this will throw if user isn't logged in
      var app = request.app;
      var config = app.get("config");
      config.user = request.user = await testConnection();
      next();
    } catch (err) {
      console.log(`Unable to authorize Google connection ("${err.message}")`);
      // not connected, reroute to auth
      response.status(302);
      response.set("Location", "/authorize");
      response.send();
    }
  };

  // test on list route, as well as individual graphics
  app.use("/graphic/:slug/$", check);
  app.use("/$", check);
};
