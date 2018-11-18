var less = require("less");
var fs = require("fs").promises;

module.exports = function(app) {
    
  app.set("processLESS", async function(file) {
    var source = await fs.readFile(file, "utf-8");
    var rendered = await less.render(source);
    return rendered.css;
  });
};