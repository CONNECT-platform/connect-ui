export const _VarNames =
  ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];


export class Namer {
  private index: number = 0;
  private series: number = 0;

  constructor(private names: string[] = _VarNames) {}

  public get next(): string {
    let name = this.names[this.index];
    if (this.series > 0) name += this.series;

    this.index++;
    if (this.index >= this.names.length) {
      this.index = 0;
      this.series++;
    }

    return name;
  }

  public retrack(): Namer {
    if (this.index > 0) {
      this.index--;
      if (this.index < 0 && this.series > 0) {
        this.index = 0;
        this.series--;
      }
    }

    return this;
  }

  public reset(): Namer {
    this.index = 0;
    this.series = 0;
    return this;
  }
}
