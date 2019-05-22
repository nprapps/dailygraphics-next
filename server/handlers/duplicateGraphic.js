var duplicateGraphic = require("../../lib/duplicateGraphic");

module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");
  var livereload = app.get("livereload");
  var { original } = request.params;
  var { slug } = request.body;

  console.log(`Attemptimg to duplicate ${original}...`);
  console.log("Pausing live reload...");
  livereload.close();

  try {
    var duplicate = await duplicateGraphic(config, original, slug);
    response.status(302);
    response.set("Location", `/graphic/${duplicate}/`);
    response.send();
  } catch (err) {
    response.status(500);
    console.log(err);
    response.send({ error: err.message });
  }

  console.log("Restarting live reload...");
  livereload.reopen();
};
