var { google } = require("googleapis");
var { promisify } = require("util");
var sheets = require("google-spreadsheets");

var { getClient } = require("./googleAuth");

var camelCase = function(str) {
  return str.replace(/[^\w]+(\w)/g, function(all, match) {
    return match.toUpperCase();
  });
};

var cast = function(str) {
  if (typeof str !== "string") {
    if (typeof str.value == "string") {
      str = str.value;
    } else {
      return str;
    }
  }
  if (str.match(/^-?[1-9][\d\.]*$/) || str == "0") {
    //number
    return Number(str.replace(/,/g, ""));
  }
  if (str.toLowerCase() == "true" || str.toLowerCase() == "false") {
    return str.toLowerCase() == "true" ? true : false;
  }
  return str;
};

var getBook = options => new Promise((ok, fail) => {
  sheets(options, function(err, book) {
    if (err) return fail(err);
    ok(book);
  });
});

var getSheet = async function(key) {

  var auth = await getClient();

  var workbook = await getBook({ key, auth });
  var COPY = {};

  var getCells = sheet => new Promise((ok, fail) => {
    var options = { key, worksheet: sheet.id };
    sheet.cells(options, (err, page) => {
      if (err) return fail(err);
      ok(page.cells);
    });
  });

  for (var i = 0; i < workbook.worksheets.length; i++) {
    var sheet = workbook.worksheets[i];
    var { title } = sheet;
    var cells = await getCells(sheet);
    var rowNumbers = Object.keys(cells);
    var header = cells[rowNumbers.shift()];
    var headers = [];
    var isKeyed = false;

    for (var cell in header) {
      var v = header[cell].value;
      var h = headers[cell] = v;
      if (h == "key") isKeyed = true;
    }

    var data = COPY[title] = isKeyed ? {} : [];

    rowNumbers.forEach(r => {
      var line = cells[r];
      var columnNumbers = Object.keys(line);
      var row = {};
      columnNumbers.forEach(c => {
        var value = line[c];
        if (value == "") return;
        var key = headers[c];
        if (!key) return;
        row[key] = cast(value);
      });

      // ignore empty objects
      var keyCount = Object.keys(row).length;
      if (!keyCount) return;

      if (isKeyed) {
        var k = row.key;
        delete row.key;
        // if it only had the key, we're done
        if (keyCount == 1) return;
        // if it only had key + value, set that directly
        data[k] = "value" in row && keyCount == 2 ? row.value : row;
      } else {
        data.push(row);
      }
    });
  }

  return COPY;

};

var copySheet = async function(original, title, destination) {
  var auth = await getClient();
  google.options({ auth });

  var drive = google.drive("v3");
  var options = {
    fileId: original,
    resource: {
      name: title + " COPY"
    },
    supportsTeamDrives: true
  };
  if (destination) options.resource.parents = [ destination ];
  var copy = await drive.files.copy(options);
  return copy.data;
};

var testConnection = async function() {
  var auth = await getClient();
  google.options({ auth });
  var drive = google.drive("v3");
  var result = await drive.about.get({
    fields: ["user"]
  });
  console.log(`Connected to Google as ${result.data.user.displayName}`);
  return result.data.user;
}

module.exports = { getSheet, copySheet, testConnection };