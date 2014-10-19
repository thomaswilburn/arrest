/* currently just testing code */

var fs = require("fs");
var Parser = require("./parser");

var parser = new Parser();

var testDoc = fs.readFileSync("document.rst", { encoding: "utf8" });

parser.parse(testDoc);