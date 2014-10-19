var Tree = function() {
  this.root = new Tree.Node("document");
  this.current = this.root;
}

Tree.Node = function(type) {
  this.type = type;
  this.parent = null;
  this.contents = "";
  this.children = [];
};

Tree.prototype = {
  enterNode: function(type) {
    var node = new Tree.Node(type);
    node.parent = this.current;
    this.current.children.push(node);
    this.current = node;
    return this;
  },
  exitNode: function() {
    this.current = this.current.parent;
    return this;
  },
  write: function(text) {
    this.current.contents = text;
    return this;
  }
};

module.exports = Tree;