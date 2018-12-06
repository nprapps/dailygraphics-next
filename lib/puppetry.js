var carlo = require("carlo");
var fs = require("fs");

var wait = (delay) => new Promise(ok => {
  setTimeout(ok, delay);
});

var snapGraphic = async function(url, destination) {
  // Carlo doesn't currently support true headless mode
  var chrome = await carlo.launch({
    // args: [ "--headless" ],
    width: 600
  });
  chrome.serveOrigin("http://localhost:8000");
  var window = chrome.mainWindow();
  await chrome.load(url);
  console.log("Loaded page in headless browser...");
  // give the script time to run
  await wait(1000);
  var page = await window.pageForTest();
  var clip = await page.evaluate(function() {
    var { x, y, width, height } = document.querySelector(".graphic").getBoundingClientRect();
    return { x, y, width, height };
  });
  console.log("Taking screenshot...");
  await page.screenshot({
    path: destination,
    clip
  });

  await chrome.exit();
}

module.exports = {
  snapGraphic
}