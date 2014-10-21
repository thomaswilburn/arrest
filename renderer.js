//var directives = require("./directives");

var selfClosing = "img br hr".split(" ");

var makeTag = function(name, attributes, content) {
  if (typeof attributes == "string") {
    content = attributes;
    attributes = {};
  }
  var open = "<" + name;
  var close;
  for (var attr in attributes) {
    open += " " + attr + "=\"" + attributes + "\"";
  }
  if (selfClosing.indexOf(name) > -1) {
    open += "/>";
    close = "";
  } else {
    open += ">";
    close = "</" + name + ">";
  }
  return open + content + close;
};

var tagMap = {
  "document": "body",
  "bullet-list": "ul",
  "list-item": "li",
  "paragraph": "p",
  "literal": "code",
  "title": "h1"
};

var renderHTML = function(tree) {
  var walk = function(node) {
    if (node.type == "text") return node.contents;
    var innerHTML = node.contents + node.children.map(walk).join("\n");
    return makeTag(tagMap[node.type], null, innerHTML);
  }
  return walk(tree.root);
};

module.exports = {
  toHTML: renderHTML
};