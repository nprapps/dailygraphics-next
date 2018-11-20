var { promisify } = require("util");
var { getClient } = require("./googleAuth");
var { google } = require("googleapis");
var sheets = require("google-spreadsheets");

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
  if (str.match(/^-?[\d\.,]+$/)) {
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
      var h = headers[cell] = header[cell].value;
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
        row[key] = cast(value);
      });

      // ignore empty objects
      if (!Object.keys(row).length) return;

      if (isKeyed) {
        var k = row.key;
        delete row.key;
        data[k] = "value" in row && columnNumbers.length == 2 ? row.value : row;
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
      name: title
    }
  };
  if (destination) options.parents = [ destination ];
  var copy = await drive.files.copy(options);
  return copy.data;
};

module.exports = { getSheet, copySheet };