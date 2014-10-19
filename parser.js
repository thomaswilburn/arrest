var Tree = require("./tree");

var patterns = {
  text: /^./,
  title: /^(\!|"|#|\$|%|&|'|\(|\)|\*|\+|,|-|\.|\/|:|;|<|=|>|\?|@|[|\\|]|\^|_|`|\{|\||\}|~)+$/,
  transition: /^(\!|"|#|\$|%|&|'|\(|\)|\*|\+|,|-|\.|\/|:|;|<|=|>|\?|@|[|\\|]|\^|_|`|\{|\||\}|~){4,}$/,
  bullet: /^\s*[-*+]\s/
};

var Parser = function() {
  this.lines = [];
  this.tree = new Tree();
  this.state = "blank";
  this.stateStack = []; //stack of nested states
  this.refs = {};
  this.titles = [];
  this.directives = {}; //require("./directives")
  this.lineNumber = 0;
  this.indentation = 0;
  this.indentStack = []; //stack of nested indentation levels
};

Parser.prototype = {
  pushStacks: function(state, indent) {
    this.stateStack.push(this.state);
    this.state = state;
    if (indent) {
      this.indentStack.push(this.indentation);
      this.indentation = indent;
    }
  },
  popStacks: function() {
    this.state = this.stateStack.pop() || "blank";
    this.indentation = this.indentStack.pop() || 0;
  },
  parseInlines: function(line, tree) {
    tree.enterNode("text").write(line).exitNode();
  },
  parseLine: function(line) {
    var tree = this.tree;
    switch (this.state) {
      case "blank":
        line = line.trim();
        if (!line) return;
        if (line.match(patterns.title)) {
          //check the previous line, possibly revert and update
          var previous = tree.current.getLastChild();
          if (previous.type == "paragraph") {
            tree.current.children.pop();
            tree.enterNode("title").write(previous.contents).exitNode();
          }
        } else if (line.match(patterns.bullet)) {
          //enter the bullet state with a new parse stack
          this.state = "bullets";
          tree.enterNode("bullet-list");
          return true;
        } else {
          //add a new paragraph node
          tree.enterNode("paragraph");
          this.parseInlines(line, tree);
          tree.exitNode();
        }
      break;

      case "bullets":
        if (line.match(patterns.bullet)) {

          //does this match the current indentation?
          var indent = line.match(/^\s*/)[0].length;
          //if it's deeper, it should be a sublist
          if (indent > this.indentation) {
            this.pushStacks("bullets", indent);
            tree.enterNode("bullet-list");
            return true;
          } else if (indent < this.indentation) {
            //if it's a higher indent, jump out
            tree.exitNode();
            this.popStacks();
            return true;
          }

          //pull and parse as many continuation lines as possible for this item
          tree.enterNode("list-item");
          this.parseInlines(line.replace(patterns.bullet, ""), tree);
          var prefix = line.match(patterns.bullet)[0];
          var nextLine = this.lines[this.lineNumber+1];
          var continues = new RegExp("^" + new Array(prefix.length + 1).join(" "));
          while (nextLine.match(continues)) {
            this.lineNumber++;
            this.parseInlines(nextLine.replace(continues, ""), tree);
            nextLine = this.lines[this.lineNumber+1];
          }
          tree.exitNode();
          
        } else if (!line.trim()) {
          //skip blank lines
        } else {
          //hit a non-bullet line, let's backtrack
          tree.exitNode();
          this.popStacks();
          return true;
        }
      break;

      case "enumerated":

      break;

      case "literal":

      break;

      case "quote":

      break;

      case "table":

      break;

      default:
        throw "Parser ended up in unknown state: " + this.state;
    }
  },
  parse: function(doc) {
    var lines = this.lines = doc.split("\n");
    while (this.lineNumber < lines.length) {
      var line = lines[this.lineNumber];
      //parseLine returns true if it needs to retry
      if (!this.parseLine(line)) {
        this.lineNumber++;
      }
    }
    this.tree.log();
  }
};

module.exports = Parser;