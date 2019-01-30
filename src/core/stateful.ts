import { Agent } from './base/agent';
import { Signature } from './base/signature';
import { State } from './state';


export interface StatefulSignature extends Signature {
  states: string[];
}

export class Stateful extends Agent {
  private states: {[name: string]: State<any>} = {};

  constructor(signature: StatefulSignature) {
    super({
      inputs: (signature.inputs || []).concat(signature.states),
      outputs: (signature.outputs || []).concat(signature.states),
      signals: signature.signals,
    });

    signature.states.forEach(state => {
      let _state = this.createState(state);
      let input = this.inputs.get(state);
      let output = this.outputs.get(state);

      this.states[state] = _state;

      input.onReceived.subscribe(data => _state.in.receive(data));
      _state.out.onSent.subscribe(data => output.send(data));
    });
  }

  public state(state: string): State<any> { return this.states[state]; }

  protected createState(state: String): State<any> { return new State(); }
}
