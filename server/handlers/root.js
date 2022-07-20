var fs = require("fs").promises;
var path = require("path");
var readJSON = require("../../lib/readJSON");

var templateList = {
  "1G5p4UIsKwUK303k4gLXhAmFnret0lg3w7qLm5S62Tsg":"ai2html_graphic",
  "1nbpweBccoaBqxuyKSL6o0q_qkdponL0OWgJpbozQp58":"bar_chart",
  "1km6lszUzHwbgg9eFe1qcsUHfQBIF48r1XnFc1nQcnog":"county_map",
  "12PsbQ7uTHr_iFeJLgt7LSkU66BQUNX8_5wQrJuvjYFU":"stacked_grouped_column_chart",
  "12e3cNKWd1E2IHcDGN72URkbp7Yjb_3TbJrAxIgpYCTI":"state_grid_map",
  "1E0fEV2lnchh8l5fuTvOTR5GRuv4jVtOEI-unEOCPtd4":"portrait_pullquotes",
  "1kekyEB3w293-8Ex2R3VdsQZTQmrfJwZ6sfWxS7OBDyA":"graphic",
  "1pcLyLFhEpKMlNpp3UqWZ1XgW8ZaloVe_d04CGdNnEWc":"dot_chart",
  "1a8F0oYWVC0BdEpG8Mbz2HKRkGIn0XQiGWTcVZMXeVdQ":"table",
  "1kekyEB3w293-8Ex2R3VdsQZTQmrfJwZ6sfWxS7OBDyA":"d3_graphic",
  "1wq0oi5HfgfYBdDs32-Qs77xmnI9VMXPUgRHA8lKIRmM":"annotated_line_chart",
  "1QTLmFGjd2BCU3QQvvXb-8RN9YkztBFOaOeaZ40SEKjw":"block_histogram",
  "1-wN8QJAaAE5zzIMcbfPPchPWAGFj6BnpZrU72Fp6cm4":"column_chart",
  "1G5p4UIsKwUK303k4gLXhAmFnret0lg3w7qLm5S62Tsg":"ai2html_map",
  "1DLHWPcJcGoKHRGBtATdBbZVIT0EuiAXG_SiQiDucazg":"stacked_bar_chart",
  "1DLxMcQRpyp1rqGJTjC28jJH5Df1GYrJrJnBl2PW9-MU":"line_chart",
  "19d-SxZs0z5fl7pETB427wp4DYzNwB5znkNZg6kF69j4":"grouped_bar_chart",
  "1tCkiSX2QV2_LjXWW6sNe7s9MqREeDEYrIGQF8mb0OHw":"stacked_column_chart"
}

var getFolders = async function(dir) {
  var listing = await fs.readdir(dir);
  var matching = [];
  for (var entry of listing) {
    if (entry.match(/^[._]|node_modules/)) continue;
    var stat = await fs.stat(path.join(dir, entry));
    if (!stat.isDirectory()) continue;
    try {
      var manifest = await fs.stat(path.join(dir, entry, "manifest.json"));
      matching.push(entry);
    } catch (err) {
      console.log(`"${entry}" is missing manifest.json, not loaded`);
    }
  }
  return matching;
};

var getMetadata = async function(data,dir) {
  var metadata = {};
  for (var i = 0; i < data.length; i++) {
    var manifestPath = path.join(dir, data[i], "manifest.json");
    var manifest = await readJSON(manifestPath);
    if (manifest.templateType && manifest.templateType != "test") {
      var template = manifest.templateType;
    } 
    else if (manifest.templateType == "test") {
      var template = templateList[manifest.templateSheet];
      
      manifest.templateType = template;
      // update manifest with test
      await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    } else {
      template = "";
    }

    if (manifest.parent) {
      var parent = manifest.parent;
    } else {
      var parent = [];
    }

    metadata[data[i]] = {
      "templateType":template,
      "parent":parent
    }
  }
  return metadata;
};


module.exports = async function(request, response) {
  var app = request.app;
  var config = app.get("config");

  var graphics = await getFolders(config.root);
  var templates = await getFolders(config.templateRoot);

  var graphicMetadata = await getMetadata(graphics,config.root)

  response.render("rootList.html", { graphics, templates, graphicMetadata });
};
