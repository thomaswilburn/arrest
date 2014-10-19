var Tree = require("./tree");

var Parser = function() {
  this.tree = new Tree();
  this.state = "normal";
  this.refs = {};
  this.titles = [];
  this.directives = {}; //require("./directives")
  this.lineNumber = 0;
};

Parser.prototype = {
  parseLine: function(line) {
    console.log(line);
    switch (this.state) {
      case "normal":

      break;

      case "bullets":

      break;

      case "enumerated":

      break;

      case "literal":

      break;

      case "quote":

      break;

      default:
        throw "Parser ended up in unknown state: " + this.state;
    }
  },
  parse: function(doc) {
    var lines = doc.split("\n");
    while (this.lineNumber < lines.length) {
      var line = lines[this.lineNumber];
      this.parseLine(line);
      this.lineNumber++;
    }
  }
};

Parser.patterns = {
  paragraph: /^./,
  title: /^(\!|"|#|\$|%|&|'|\(|\)|\*|\+|,|-|\.|\/|:|;|<|=|>|\?|@|[|\\|]|\^|_|`|\{|\||\}|~)+$/,
  transition: /^(\!|"|#|\$|%|&|'|\(|\)|\*|\+|,|-|\.|\/|:|;|<|=|>|\?|@|[|\\|]|\^|_|`|\{|\||\}|~){4,}$/,
  bullet: /^\s*[-*+]\s/
};

module.exports = Parser;