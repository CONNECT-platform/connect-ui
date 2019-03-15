export class Stack<T> {
  private stuff: T[] = [];

  public push(t: T): Stack<T> {
    this.stuff.push(t);
    return this;
  }

  public get peek(): T {
    if (!this.empty)
      return this.stuff[this.stuff.length - 1];
  }

  public pop(): T {
    if (!this.empty) {
      let t = this.peek;
      this.stuff.splice(-1, 1);
      return t;
    }
  }

  public get empty(): boolean {
    return this.stuff.length == 0;
  }
}
