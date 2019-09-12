var { google } = require("googleapis");

var scopes = ["https://www.googleapis.com/auth/drive", "https://www.googleapis.com/auth/spreadsheets"];

var getClient = async function() {
  const auth = await google.auth.getClient({
    scopes: scopes
  });

  return auth;
};

module.exports = { getClient, scopes }
