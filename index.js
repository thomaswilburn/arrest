/* currently just testing code */

var fs = require("fs");
var Parser = require("./parser");
var render = require("./renderer");

var parser = new Parser();

var testDoc = fs.readFileSync("document.rst", { encoding: "utf8" });

try {
  var tree = parser.parse(testDoc);
  console.log(render.toHTML(tree));
} catch (err) {
  console.log(err);
  parser.tree.log();
  console.log(parser.lineNumber, parser.state);
}