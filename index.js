/* currently just testing code */

var fs = require("fs");
var Parser = require("./parser");

var parser = new Parser();

var testDoc = fs.readFileSync("document.rst", { encoding: "utf8" });

try {
  parser.parse(testDoc);
} catch (err) {
  console.log(err);
  parser.tree.log();
  console.log(parser.lineNumber, parser.state);
}