var toast = document.createElement("div");
toast.className = "toast";
document.body.appendChild(toast);

var toastTimeout = null;
export var showToast = function(str, delay = 4000) {
  if (toastTimeout) clearTimeout(toastTimeout);
  toast.innerHTML = str;
  toast.classList.add("show");
  toastTimeout = setTimeout(() => toast.classList.remove("show"), delay);
};