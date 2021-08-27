var fs = require("fs").promises;

module.exports = async function(request, response) {

  // turn the path into a Node require string and resolve it
  var path = request.params[0];
  var location = require.resolve(path);
  response.sendFile(location);

}