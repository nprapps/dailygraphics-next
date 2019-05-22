import { showToast } from "./toast.js";
import { $ } from "./qsa.js";

var searchInput = $.one(".search-graphics");
var graphicItems = $(".graphics-list .item");

var filterGraphics = function() {
  var value = searchInput.value;
  var re = new RegExp(value);
  graphicItems.forEach(li => {
    var { slug } = li.dataset;
    li.classList.toggle("hide", !slug.match(re));
  });
};

searchInput.addEventListener("keyup", filterGraphics);
filterGraphics();

var createShade = $.one(".create.shade");
var toggleCreate = $.one(".new-graphic");
toggleCreate.addEventListener("click", function() {
  var pressed = this.getAttribute("aria-pressed") == "true";
  var updated = !pressed;
  this.setAttribute("aria-pressed", updated);
  createShade.classList.toggle("show", updated);
  if (updated) {
    $.one(`#template`).focus();
  }
});

var submitButton = $.one(`.create.shade button[type="submit"]`);
submitButton.addEventListener("click", function() {
  var slug = $.one(`[name="slug"]`);
  if (slug.value) {
    showToast("Creating graphic... please wait");
  } else {
    showToast("Please enter a slug for your graphic");
  }
});
