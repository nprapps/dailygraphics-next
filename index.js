var init = async function() {
  var server = require("./server");
  var readJSON = require("./lib/readJSON");

  var config = await readJSON("./config.json");
  server(config);
};

var environmentWhitelist = [
  "AWS_ACCESS_KEY_ID",
  "AWS_SECRET_ACCESS_KEY",
  "GOOGLE_OAUTH_CLIENT_ID",
  "GOOGLE_OAUTH_CONSUMER_SECRET"
];

var allSet = true;
environmentWhitelist.forEach(function(env) {
  if (!process.env[env]) {
    console.log(`Missing environment variable: ${env}`);
    allSet = false;
  }
});
if (allSet) {
  init();
} else {
  console.log("Please set these variables in order to use the graphics rig.");
  // exit code 2 kills Nodemon for us
  process.exit(2);
}
