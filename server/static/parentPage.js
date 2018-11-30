import "/remoteConsole.js";
import { showToast } from "./toast.js";
import { $ } from "./qsa.js";

var copyTexts = $(".copy-on-click");
copyTexts.forEach(c => c.addEventListener("click", function() {
  this.selectionStart = 0;
  this.selectionEnd = this.value.length;
  document.execCommand("copy");
  var name = this.getAttribute("aria-label");
  showToast(`${name} copied to clipboard`);
}));

var reloadButton = $.one(".refresh-sheet");

reloadButton.addEventListener("click", function() {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "./refresh-sheet");
  xhr.send();
  xhr.onload = () => window.location.reload();
});

var deployButton = $.one(".deploy-graphic");
deployButton.addEventListener("click", async function() {
  showToast("Deploying graphic...");
  var response = await fetch("./deploy", { method: "POST" });
  var json = await response.json();
  if (json.success) {
    showToast("Deploy successful!");
  } else {
    showToast("Deploy failed, check console for more info");
    console.log(json.error);
  }
})