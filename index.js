var init = async function() {
  var server = require("./server");
  var readJSON = require("./lib/readJSON");
  var getAuthType = require("./lib/googleAuth").getAuthType;
  var configuration = require("./lib/configuration");

  var config = await configuration.load("./config.json");

  var environmentWhitelist = [];

  switch (getAuthType()) {
    case "service_account":
      environmentWhitelist.push("GOOGLE_APPLICATION_CREDENTIALS");
      break;
    default:
      environmentWhitelist.push("GOOGLE_OAUTH_CLIENT_ID", "GOOGLE_OAUTH_CONSUMER_SECRET");
  }

  if (!config.deployTo || config.deployTo == "s3") {
    environmentWhitelist.push("AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY");
  }

  var allSet = true;
  environmentWhitelist.forEach(function(env) {
    if (!process.env[env]) {
      console.log(`Missing environment variable: ${env}`);
      allSet = false;
    }
  });
  if (allSet) {
    server(config);
  } else {
    console.log("Please set these variables in order to use the graphics rig.");
    // exit code 2 kills Nodemon for us
    process.exit(2);
  }

};

init();
