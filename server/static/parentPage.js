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