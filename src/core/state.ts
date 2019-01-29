import { Agent } from './base/agent';
import { InputPin, PersistentOutput } from './base/io';


export class State<_Type> extends Agent {
  constructor(value?: _Type) {
    super({inputs: ['in'], outputs: ['out']});

    this.in.onReceived.subscribe((value: _Type) => {
      this.out.send(value);
    });

    this.control.onActivated.subscribe(() => {
      if (this.out.activated)
        this.out.send(this.out.last);
    });

    if (value) this.value = value;
  }

  public get in(): InputPin<_Type> { return this.inputs.get('in'); }
  public get out(): PersistentOutput<_Type> { return this.outputs.get('out'); }

  public get value(): _Type { return this.out.last; }
  public set value(value: _Type) { this.in.receive(value); }

  protected createOutput(output: string): PersistentOutput<_Type> { return new PersistentOutput<_Type>(); }
}
