var getAuthType = function() {
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return "service_account";
  } else {
    return "oauth";
  }
}

var getAuthModule = function() {
  switch (getAuthType()) {
    case "service_account":
      return require("./googleServiceAuth");
    default:
      return require("./googleOAuth");
  }
}

module.exports = { getAuthType, getAuthModule }
