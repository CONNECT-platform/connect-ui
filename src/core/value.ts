import { Agent } from './base/agent';
import { PersistentOutput } from './base/io';


export class Value<_Type> extends Agent {
  constructor(value: _Type) {
    super({outputs: ['out']});

    this.out.send(value);
  }

  protected bind() {
    this.control.onActivated.subscribe(() => {
      if (this.out.activated) this.out.send(this.out.last);
    });
  }

  public get out(): PersistentOutput<_Type> { return this.outputs.get('out'); }
  public get value(): _Type { return this.out.last; }

  protected createOutput(output: string): PersistentOutput<_Type> { return new PersistentOutput<_Type>(); }
}
