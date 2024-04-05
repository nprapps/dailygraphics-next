import { showToast } from "./toast.js";
import { $ } from "./qsa.js";

var slugInput = $.one(".search-graphics");
var templateInput = $.one(".search-templates");

var graphicItems = $(".graphics-list .item");

var filterGraphics = function(inputBox,items,key) {
  var value = inputBox.value;
  
  if (key == "template") {
    value = value.replaceAll(" ","_")
  } 

  var re = new RegExp(value);

  items.forEach(tr => {
    var thing = tr.dataset[key];
    tr.classList.toggle("hide", !thing.match(re));
  });
};

slugInput.addEventListener("keyup", () => filterGraphics(slugInput,graphicItems,"slug"));
filterGraphics(slugInput,graphicItems,"slug");

templateInput.addEventListener("keyup", () => filterGraphics(templateInput,graphicItems,"template"));
filterGraphics(templateInput,graphicItems,"template");

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
