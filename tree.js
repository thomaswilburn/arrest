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

Tree.Node.prototype = {
  getLastChild: function() {
    return this.children[this.children.length - 1];
  }
};

Tree.prototype = {
  enterNode: function(type) {
    var node = new Tree.Node(type);
    node.parent = this.current;
    this.current.children.push(node);
    this.current = node;
    return this;
  },
  exitNode: function(closest) {
    if (closest) while (this.current.type != closest) {
      this.current = this.current.parent;
    }
    this.current = this.current.parent;
    return this;
  },
  write: function(text) {
    this.current.contents += text;
    return this;
  },
  append: function(nodes) {
    if (!(nodes instanceof Array)) {
      nodes = [nodes];
    }
    var children = this.current.children;
    children.push.apply(children, nodes);
  },
  log: function() {
    var walk = function(node, depth) {
      var padding = depth ? (new Array(depth + 1)).join("  ") : "";
      console.log(padding, node.type, node.contents);
      for (var i = 0; i < node.children.length; i++) {
        walk(node.children[i], depth + 1);
      }
    };
    walk(this.root, 0);
  }
};

module.exports = Tree;