import "./remoteConsole.js";
import { showToast } from "./toast.js";
import { $ } from "./qsa.js";

var delay = (d = 1000) => new Promise(ok => setTimeout(ok, d));

var copyTexts = $(".copy-on-click");
copyTexts.forEach(c =>
  c.addEventListener("click", function() {
    this.selectionStart = 0;
    this.selectionEnd = this.value.length;
    document.execCommand("copy");
    var name = this.getAttribute("aria-label");
    showToast(`${name} copied to clipboard`);
  })
);

var reloadButton = $.one(".refresh-sheet");

reloadButton.addEventListener("click", function() {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "./refresh-sheet");
  xhr.send();
  xhr.onload = () => window.location.reload();
});

var deployButton = $.one(".deploy-graphic");
deployButton.addEventListener("click", async function() {
  var confirmation = window.confirm("Are you sure you want to deploy?");
  if (!confirmation) return;
  showToast("Capturing fallback.png...");
  var capture = await fetch("./captureFallback", { method: "POST" });
  if (!capture.ok) {
    showToast("Unable to capture fallback image!", "error");
    await delay(3000);
  }
  showToast("Deploying graphic...");
  var response = await fetch("./deploy", { method: "POST" });
  var json = await response.json();
  if (json.success) {
    showToast("Deploy successful!");
  } else {
    showToast("Deploy failed, check console for more info");
    console.log(json.error);
  }
});

var showDuplicate = $.one(".show-duplicate");
var duplicateShade = $.one(".copy.shade");
showDuplicate.addEventListener("click", function() {
  duplicateShade.classList.toggle("show");
  var shown = duplicateShade.classList.contains("show");
  this.setAttribute("aria-pressed", shown);
  if (shown) {
    // move focus
    $.one(`.copy.shade [name=slug]`).focus();
  }
});

var duplicateSubmit = $.one(".copy.shade .submit");
duplicateSubmit.addEventListener("click", function() {
  showToast("Duplicating graphic, please wait...");
});
