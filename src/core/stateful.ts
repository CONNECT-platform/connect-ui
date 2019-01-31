import { Agent } from './base/agent';
import { Signature } from './base/signature';
import { InputPin, OutputPin, PersistentOutput } from './base/io';
import { State } from './state';


export interface StatefulSignature extends Signature {
  states?: string[];
  properties?: string[];
}

export class Stateful extends Agent {
  private states: {[name: string]: State<any>};

  constructor(readonly signature: StatefulSignature) {
    super(Object.assign(signature, {
      inputs: (signature.inputs || []).concat(signature.states || []),
      outputs: (signature.outputs || []).concat(signature.states || []).concat(signature.properties || []),
    }));
  }

  public state(state: string): State<any> { return this.states[state]; }
  public property(property: string): PersistentOutput<any> {
    if (this.signature.properties && this.signature.properties.includes(property))
      return this.outputs.get(property);
    return undefined;
  }

  protected createState(state: string): State<any> { return new State(); }

  protected preBuild() {
    this.states = {};

    if (this.signature.states)
      this.signature.states.forEach(state => {
        this.states[state] = this.createState(state);
      });
  }

  protected createInput(input: string): InputPin<any> {
    if (this.signature.states && this.signature.states.includes(input))
      return this.states[input].in;
    else return super.createInput(input);
  }

  protected createOutput(output: string): OutputPin<any> | PersistentOutput<any> {
    if (this.signature.properties && this.signature.properties.includes(output))
      return new PersistentOutput<any>();
    else if (this.signature.states && this.signature.states.includes(output))
      return this.states[output].out;
    else return super.createOutput(output);
  }
}
