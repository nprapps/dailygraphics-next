var $ = (s, d = document) => Array.from(d.querySelectorAll(s));
$.one = (s, d = document) => d.querySelector(s);

var searchInput = $.one(".search-graphics");
var graphicItems = $(".graphics-list .item");

var filterGraphics = function() {
  var value = searchInput.value;
  var re = new RegExp(value);
  graphicItems.forEach(li => {
    var { slug } = li.dataset;
    console.log(slug);
    li.classList.toggle("hide", !slug.match(re));
  });
};

searchInput.addEventListener("keyup", filterGraphics);
filterGraphics();

var createShade = $.one(".create-shade");
var toggleCreate = $.one(".new-graphic");
toggleCreate.addEventListener("click", function() {
  var pressed = this.getAttribute("aria-pressed") == "true";
  var updated = !pressed;
  this.setAttribute("aria-pressed", updated);
  createShade.classList.toggle("show", updated);
});