class Stack {
  constructor() {
    this.stuff = [];
  }

  push(t) {
    this.stuff.push(t);
    return this;
  }

  get peek() {
    if (!this.empty)
      return this.stuff[this.stuff.length - 1];
  }

  pop() {
    if (!this.empty) {
      let t = this.peek;
      this.stuff.splice(-1, 1);
      return t;
    }
  }

  get empty() {
    return this.stuff.length == 0;
  }
}

module.exports.Stack = Stack;
