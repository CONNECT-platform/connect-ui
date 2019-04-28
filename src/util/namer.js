const _VarNames =
  ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];


class Namer {
  constructor(names) {
    this.names = names || _VarNames;
    this.index = 0;
    this.series = 0;
  }

  get next() {
    let name = this.names[this.index];
    if (this.series > 0) name += this.series;

    this.index++;
    if (this.index >= this.names.length) {
      this.index = 0;
      this.series++;
    }

    return name;
  }

  retrack() {
    if (this.index > 0) {
      this.index--;
      if (this.index < 0 && this.series > 0) {
        this.index = 0;
        this.series--;
      }
    }

    return this;
  }

  reset() {
    this.index = 0;
    this.series = 0;
    return this;
  }
}

module.exports.Namer = Namer;
module.exports._VarNames = _VarNames;
