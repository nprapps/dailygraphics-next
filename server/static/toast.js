var toast = document.createElement("div");
toast.className = "toast";
toast.setAttribute("aria-live", "assertive");
toast.setAttribute("role", "log");
document.body.appendChild(toast);

var toastTimeout = null;
export var showToast = function(str, displayAttr = "", delay = 4000) {
  if (toastTimeout) clearTimeout(toastTimeout);
  toast.innerHTML = str;
  toast.classList.add("show");
  toast.setAttribute("data-type", displayAttr);
  toastTimeout = setTimeout(() => toast.classList.remove("show"), delay);
};
