var fs = require("fs").promises;
var path = require("path");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");
  var { create } = app.get("graphicOps");
  var { template, slug } = request.body;
  if (!slug) {
    response.status(302);
    response.set("Location", "/?error=Missing slug for new graphic");
    return response.send();
  }

  var fullSlug = await create(config, template, slug);

  response.status(302);
  response.set({
    "Location": `/graphic/${fullSlug}/`
  });
  response.send();

};