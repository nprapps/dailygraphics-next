var { google } = require("googleapis");
var { promisify } = require("util");

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
  if (str.match(/^(-?(0?\.0*)?[1-9][\d\.,]*|0)$/)) {
    //number, excluding those with leading zeros (could be ZIP codes or octal)
    var n = Number(str.replace(/,/g, ""));
    if (!isNaN(n)) return n;
    return str;
  }
  if (str.toLowerCase() == "true" || str.toLowerCase() == "false") {
    return str.toLowerCase() == "true" ? true : false;
  }
  return str;
};

var api = google.sheets("v4");

var getSheet = async function(spreadsheetId) {

  var auth = await getClient();

  var COPY = {};

  var book = (await api.spreadsheets.get({ auth, spreadsheetId })).data;
  var { sheets, spreadsheetId } = book;
  var ranges = sheets
    .map(s => `${s.properties.title}!A:AAA`)
    .filter(s => s[0] != "_"); // filter out sheets prefixed with _
  var response = await api.spreadsheets.values.batchGet({
    auth,
    spreadsheetId,
    ranges,
    majorDimension: "ROWS"
  });
  var { valueRanges } = response.data;
  for (var sheet of valueRanges) {
    var { values, range } = sheet;
    if (!values) continue;
    values = values.filter(v => v.length);
    var [ title ] = range.split("!");
    var header = values.shift();
    var isKeyed = header.indexOf("key") > -1;
    var isValued = header.indexOf("value") > -1;
    var out = isKeyed ? {} : [];
    for (var row of values) {
      var obj = {};
      row.forEach(function(value, i) {
        var key = header[i];
        obj[key] = cast(value);
      });
      if (isKeyed) {
        out[obj.key] = isValued ? obj.value : obj;
      } else {
        out.push(obj);
      }
    }
    COPY[title] = out;
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
  if (destination) options.resource.parents = [destination];
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
};

module.exports = { getSheet, copySheet, testConnection };
