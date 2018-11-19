var os = require("os");
var path = require("path");
var fs = require("fs").promises;

var { google } = require("googleapis");
var opn = require("opn");

var clientID = process.env.GOOGLE_OAUTH_CLIENT_ID;
var secret = process.env.GOOGLE_OAUTH_CONSUMER_SECRET;

var tokenPath = path.join(os.homedir(), ".google_oauth_token");

var getClient = async function() {
  var tokens = await fs.readFile(tokenPath, "utf-8");
  tokens = JSON.parse(tokens);
  auth = new google.auth.OAuth2(clientID, secret);
  auth.setCredentials(tokens);

  auth.on("tokens", async function(update) {
    console.log("new OAuth token", update);
    Object.assign(tokens, update);
    fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2));
  });

  return auth;
};

var getAuthURL = function() {
  return client.generateAuthUrl({
    access_type: "offline",
    scope: scopes.join(" ")
  });
};

var scopes = [
  "https://www.googleapis.com/auth/drive",
  "https://www.googleapis.com/auth/spreadsheets"
];

module.exports = { getClient, getAuthURL, scopes, tokenPath };