/*

Loads our token file and attempts to use it to authenticate against Google's OAuth endpoint
This could (should?) be replaced with @nprapps/google-login

*/

var fs = require("fs").promises;
var os = require("os");
var path = require("path");

var { google } = require("googleapis");

var clientID = process.env.GOOGLE_OAUTH_CLIENT_ID;
var secret = process.env.GOOGLE_OAUTH_CONSUMER_SECRET;
var serviceAccount = process.env.GOOGLE_APPLICATION_CREDENTIALS;

var tokenPath = path.join(os.homedir(), ".google_oauth_token");

var scopes = ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"];

var getClient = async function(redirect = "http://localhost:8000/authenticate/") {
  if (serviceAccount) {
    return google.auth.getClient({
      scopes: scopes
    });
  }

  var auth = new google.auth.OAuth2(clientID, secret, redirect);
  try {
    var tokens = await loadTokenFile();
    auth.setCredentials(tokens);
  } catch (err) {
    // token file won't exist on first login
  }

  auth.on("tokens", updateTokenFile);

  return auth;
};

var loadTokenFile = async function() {
  var tokens = await fs.readFile(tokenPath, "utf-8");
  tokens = JSON.parse(tokens);
  if (!tokens.access_token && !tokens.refresh_token) throw "Token file contains no actual tokens";
  return tokens;
};

var updateTokenFile = async function(update) {
  try {
    var tokens = await loadTokenFile();
  } catch (err) {
    var tokens = {};
  }
  Object.assign(tokens, update);
  if (!tokens.refresh_token) {
    console.log("WARNING: No refresh_token in your Google OAuth credentials. You may have trouble staying signed in.");
    console.log(
      "If problems persist, visit https://myaccount.google.com/permissions and revoke permissions for this app, then reauthorize locally."
    );
  }
  await fs.writeFile(tokenPath, JSON.stringify(tokens, null, 2));
  return tokens;
};

module.exports = { getClient, scopes, tokenPath, loadTokenFile, updateTokenFile };
