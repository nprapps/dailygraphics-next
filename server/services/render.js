var compile = require("lodash.template");
var path = require("path");

var processHTML = require("../../lib/processHTML");

var viewPath = path.join(process.cwd(), "server/templates");

module.exports = function(app) {
  var render = async function(path, data, callback) {
    try {
      var rendered = await processHTML(path, data);
      callback(null, rendered);
    } catch(err) {
      callback(null, `
<pre>
Could not process parent page HTML (${err})
Check the terminal for details.
</pre>`);
      throw err;
    }
  };

  app.set("views", viewPath);
  app.engine("html", render);
};
