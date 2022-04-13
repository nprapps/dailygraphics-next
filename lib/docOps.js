var { google } = require("googleapis");
var { getClient } = require("./googleAuth");
var betty = require("@nprapps/betty");

var formatters = {
  link: (text, style) => `<a href="${style.link.url}">${text}</a>`,
  bold: (text) => `<b>${text}</b>`,
  italic: (text) => `<i>${text}</i>`,
};

// turn the Docs tree structure into a flat text file
var processDocument = function (response) {
  var body = response.data.body.content;
  var text = "";

  var lists = response.data.lists;

  for (var block of body) {
    if (!block.paragraph) continue;
    if (block.paragraph.bullet) {
      var list = lists[block.paragraph.bullet.listId];
      var level = block.paragraph.bullet.nestingLevel || 0;
      var style = list.listProperties.nestingLevels[level];
      var bullet = "- ";
      if (style) {
        if (style.glyphType == "DECIMAL") {
          bullet = "1. ";
        }
      }
      var indent = "  ".repeat(level);
      text += indent + bullet;
    }
    for (var element of block.paragraph.elements) {
      // console.log(element);
      if (!element.textRun) continue;
      var { content, textStyle } = element.textRun;
      if (content.trim())
        for (var f in formatters) {
          if (textStyle[f]) {
            var [_, before, inside, after] = content.match(/^(\s*)(.*?)(\s*)$/);
            content = before + formatters[f](inside, textStyle) + after;
          }
        }
      text += content;
    }
  }

  text = text.replace(/\x0b/g, "\n");
  return text;
};

var getDoc = async function (documentId) {
  var auth = await getClient();
  var api = google.docs({ auth, version: "v1" }).documents;

  var suggestionsViewMode = "PREVIEW_WITHOUT_SUGGESTIONS";
  var docResponse = await api.get({ documentId, suggestionsViewMode });

  var raw = processDocument(docResponse);
  var parsed;
  try {
    parsed = betty.parse(raw, {
      onFieldName: t => t[0].toLowerCase() + t.slice(1)
    });
  } catch (err) {
    parsed = null;
  }

  return { raw, parsed };

};

module.exports = { getDoc };
