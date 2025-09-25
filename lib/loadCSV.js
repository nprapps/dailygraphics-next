
var csv = require("csv-parse");
var fs = require("fs").promises;
var path = require("path");
var readJSON = require("./readJSON");

module.exports = async function(config, slug) {

  var folder = path.join(config.root, slug);
  var manifest = await readJSON(path.join(folder, "manifest.json"));
  var files = manifest.csv || [];
  if (typeof files == "string") files = [files];

  var CSV = {};

  for (var file of files) {
    try {
      var parser = csv.parse({
        columns: true,
        cast: true
      });
      var handle = await fs.open(path.join(folder, file));
      var stream = handle.createReadStream();
      stream.pipe(parser);
      var output = [];
      var keyed = false;
      for await (var record of parser) {
        // check to see if we've found a keyed row
        if (record.key || keyed) {
          // swap output to an object the first time it happens
          if (output instanceof Array) {
            output = {};
            keyed = true;
          }
          output[record.key] = record;
          delete record.key;
        } else {
          output.push(record);
        }
      }

      /* add filename info, sanitize it, add output to large csv object under sanitized name */

      var sanitized = path.basename(file)
        .replace(".csv", "")
        .replace(/\W(\w)/g, function(_, letter) { return letter.toUpperCase() });
      console.log(`Loaded CSV data: ${sanitized}`);
      CSV[sanitized] = output;
    } catch (err) {
      console.error(`Unable to load CSV file "${file}" - check the manifest`)
    }
  };

  return CSV;

}