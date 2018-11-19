import "/remoteConsole.js";

var $ = (s, d = document) => Array.from(d.querySelectorAll(s));
$.one = (s, d = document) => d.querySelector(s);

var toast = $.one(".toast");

var toastTimeout = null;
var showToast = function(str, delay = 4000) {
  if (toastTimeout) clearTimeout(toastTimeout);
  toast.innerHTML = str;
  toast.classList.add("show");
  toastTimeout = setTimeout(() => toast.classList.remove("show"), delay);
};

var embedCode = $.one(".embed-code");
embedCode.addEventListener("click", function() {
  this.selectionStart = 0;
  this.selectionEnd = this.value.length;
  document.execCommand("copy");
  showToast("Embed code copied");
});

var preview = $.one(".preview-container");

var clickedBreakpoint = function() {
  var breakpoint = this.dataset.break;
  preview.setAttribute("data-width", breakpoint);
};

$("button.breakpoint").forEach(el => el.addEventListener("click", clickedBreakpoint));

var reloadButton = $.one(".refresh-sheet");

reloadButton.addEventListener("click", function() {
  var xhr = new XMLHttpRequest();
  xhr.open("POST", "./refresh-sheet");
  xhr.send();
  xhr.onload = () => window.location.reload();
});