var { google } = require("googleapis");
var { URL } = require("url");

var authorize = async function(request, response) {
  var app = request.app;

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    response.send("You're using a service account, you don't need to authorize.");
    return;
  }

  var { getClient, scopes } = app.get("google").auth;

  var host = request.hostname;
  var port = app.get("port");
  var redirect = `http://${host}:${port}/authenticate/`;

  var client = await getClient(redirect);
  var authURL = client.generateAuthUrl({
    access_type: "offline",
    scope: scopes.join(" "),
    // setting prompt and access_type to these values forces the API to give us a refresh token back
    prompt: "consent"
  });

  response.status(302);
  response.set("Location", authURL);
  response.send();
};

var authenticate = async function(request, response) {
  var app = request.app;
  var server = app.get("server");
  var { getClient, updateTokenFile } = app.get("google").auth;

  var client = await getClient();

  var requestURL = request.url[0] == "/" ? "http://" + request.hostname + request.url : request.url;
  var query = new URL(requestURL).searchParams;
  var code = query.get("code");
  if (!code) return;
  try {
    // this will also trigger the new token event and update our token file
    var { tokens } = await client.getToken(code);
    // await updateTokenFile(tokens);
    response.status(302);
    response.set("Location", "/");
    response.send();
  } catch (err) {
    response.status(302);
    response.set("Location", "/authorize");
    response.send(err.message);
  }
};

module.exports = { authorize, authenticate };
