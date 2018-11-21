var { testConnection } = require("../../lib/sheetOps");

module.exports = function(app) {

  app.use("/graphic/:slug/$", async function(request, response, next) {
    try {
      await testConnection();
      next();
    } catch (err) {
      console.log(err);
      // not connected, reroute to auth
      response.status(302);
      response.set("Location", "/authorize");
      response.send();
    }
  });

}