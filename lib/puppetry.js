var carlo = require("carlo");
var fs = require("fs");

carlo.enterTestMode();

var wait = (delay) => new Promise(ok => {
  setTimeout(ok, delay);
});

var snapGraphic = async function(url, destination) {
  // Carlo doesn't currently support true headless mode
  var chrome = await carlo.launch({
    // args: [ "--headless", "--disable-gpu" ],
    width: 600
  });
  var window = chrome.mainWindow();
  console.log("Carlo window ready");
  var page = window.pageForTest();
  console.log("Loading: ", url);
  await page.goto(url, { timeout: 3000, waitUntil: "domcontentloaded" });
  console.log("Loaded page in headless browser...");
  // give the script time to run
  await wait(1000);
  var page = await window.pageForTest();
  var success = false;
  try {
    var clip = await page.evaluate(function() {
      var graphic = document.querySelector(".graphic");
      if (!graphic) return null;
      var { x, y, width, height } = graphic.getBoundingClientRect();
      return { x, y, width, height };
    });
    if (!clip) {
      throw new Error("No .graphic element found.");
    }
    console.log("Taking screenshot...");
    await page.screenshot({
      path: destination,
      clip
    });
    console.log(`Captured to ${destination}`);
    success = true;
  } catch (err) {
    console.log(`Unable to capture screenshot: "${err.message}"`);
  }
  await chrome.exit();
  if (!success) throw new Error("Image capture failed.");
}

module.exports = {
  snapGraphic
}