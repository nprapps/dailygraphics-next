var os = require("os");
var path = require("path");
var fs = require("fs").promises;

var { google } = require("googleapis");
var opn = require("opn");

var clientID = process.env.GOOGLE_OAUTH_CLIENT_ID;
var secret = process.env.GOOGLE_OAUTH_CONSUMER_SECRET;

var tokenPath = path.join(os.homedir(), ".google_oauth_token");

var getClient = async function(redirect = "http://localhost:8000/authenticate/") {
  var tokens = await loadTokenFile();
  auth = new google.auth.OAuth2(clientID, secret, redirect);
  auth.setCredentials(tokens);

  auth.on("tokens", async function(update) {
    await updateTokenFile(update);
  });

  return auth;
};

var scopes = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets"
];

var loadTokenFile = async function() {
  var tokens = await fs.readFile(tokenPath, "utf-8");
  tokens = JSON.parse(tokens);
  return tokens;
};

var updateTokenFile = async function(update) {
  var tokens;
  try {
    tokens = await loadTokenFile();
  } catch (err) {
    // no token file saved
    tokens = {};
  }
  Object.assign(tokens, update);
  await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2));
  return tokens;
};

module.exports = { getClient, scopes, tokenPath, loadTokenFile, updateTokenFile };