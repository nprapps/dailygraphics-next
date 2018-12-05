(async function () {
  var server = require("./server");
  var readJSON = require("./lib/readJSON");

  var config = await readJSON("./config.json");
  server(config);
})();