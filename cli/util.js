var fs = require("fs").promises;

var completeSlug = async function(folder, fragment) {
  var folders = await fs.readdir(folder);
  var pattern = new RegExp(`^${fragment}`, "i");
  var matched = folders.filter(f => f.match(pattern));
  if (matched.length > 1) {
    throw `Multiple possible matches for ${fragment}:
${matched.map(m => `  - ${m}`).join("\n")}`;
  }
  if (matched.length == 0) throw `Unable to find matching slug for ${fragment}`;
  var [ completed ] = matched;
  if (completed != fragment) {
    console.log(`(Autocompleted "${fragment}" as ${completed})`);
  }
  return completed;
}

module.exports = {
  completeSlug
};