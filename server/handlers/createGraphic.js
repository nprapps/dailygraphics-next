var fs = require("fs").promises;
var path = require("path");
var create = require("../../lib/createGraphic");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");
  var { template, slug, createSheet, sheetID } = request.body;
  if (!slug) {
    response.status(302);
    response.set("Location", "/?error=Missing slug for new graphic");
    return response.send();
  }

  var sheet = createSheet ? null : sheetID;

  var fullSlug = await create(config, template, slug, sheet);

  response.status(302);
  response.set({
    Location: `/graphic/${fullSlug}/`
  });
  response.send();
};
