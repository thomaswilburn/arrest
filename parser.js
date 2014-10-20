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
  this.state = {
    mode: "blank",
    indentation: 0
  };
  this.stateStack = []; //stack of nested states
  this.refs = {};
  this.titles = [];
  this.directives = {}; //require("./directives")
  this.lineNumber = 0;
};

Parser.prototype = {
  pushState: function(mode, indent) {
    var state = Object.create(this.state);
    state.mode = mode;
    if (typeof indent !== undefined) state.indentation = indent;
    this.state = state;
    this.stateStack.push(this.state);
  },
  popState: function() {
    this.state = this.stateStack.pop() || { mode: "blank", indentation: 0 };
  },
  getIndentation: function(line) {
    var match = line.match(/^\s+\S/);
    if (!match) return 0;
    return match[0].length;
  },
  parseInlines: function(line, tree) {
    //check for entering a code block
    if (line.match(/::$/)) {
      line = line.replace(/([^\s])::$/, "$1:");
      this.pushState("literal");
    }
    tree.enterNode("text").write(line).exitNode();
  },
  parseLine: function(line) {
    var tree = this.tree;
    switch (this.state.mode) {
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
          this.pushState("bullets", this.getIndentation(line));
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
          var indent = this.getIndentation(line);
          //if it's deeper, it should be a sublist
          if (indent > this.state.indentation) {
            tree.enterNode("bullet-list");
            this.pushState("bullets", indent);
            return true;
          } else if (indent < this.state.indentation) {
            //if it's a higher indent, jump out
            tree.exitNode();
            this.popState();
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
          this.popState();
          return true;
        }
      break;

      case "enumerated":

      break;

      case "literal":
        if (line.match(/^[^\s]+/)) {
          this.popState();
          return true;
        }
        tree.enterNode("literal").write(line).exitNode();
      break;

      case "quote":

      break;

      case "table":

      break;

      default:
        throw "Parser ended up in unknown state: " + this.state.mode;
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