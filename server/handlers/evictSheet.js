module.exports = function(request, response) {
  var app = request.app;
  var cache = app.get("cache").partition("sheets");
  cache.clear();
  var documentCache = app.get("cache").partition("docs");
  documentCache.clear();
  response.status(200);
  response.send({ success: true });
};
