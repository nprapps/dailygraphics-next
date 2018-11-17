module.exports = function(request, response) {

  response.render("parentPage.html", request.params);

}