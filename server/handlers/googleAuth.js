var { getClient, scopes, updateTokenFile } = require("../../lib/googleAuth");
var { google } = require("googleapis");
var { URL } = require("url");

var authorize = async function(request, response) {
  var app = request.app;

  var client = await getClient();
  var authURL = client.generateAuthUrl({
    access_type: "offline",
    scope: scopes.join(" ")
  });

  var host = request.hostname;
  var port = app.get("port");
  var redirect = `http://${host}:${port}/authenticate/`;

  var parsed = new URL(authURL);
  if (!parsed.searchParams.get("redirect_uri")) {
    parsed.searchParams.set("redirect_uri", redirect);
    authURL = parsed.toString();
  }
  console.log(authURL);

  response.status(302);
  response.set("Location", authURL);
  response.send();
};

var authenticate = async function(request, response) {
  var app = request.app;
  var server = app.get("server");
  var client = await getClient();

  var requestURL = request.url[0] == "/" ? "http://" + request.hostname + request.url : request.url;
  var query = new URL(requestURL).searchParams;
  var code = query.get("code");
  if (!code) return;
  try {
    var { tokens } = await client.getToken(code);
    await updateTokenFile(tokens);
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