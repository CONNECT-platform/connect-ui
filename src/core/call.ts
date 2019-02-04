import { Node, NodeInputs, NodeOutputCallback, NodeSignalCallback } from './base/node';

import _registry from './node-registry';
import { NodeRegistry } from './node-registry';


export class Call extends Node {
  constructor(
    private path: string,
    private registry: NodeRegistry = _registry) {
    super(registry.signature(path));
  }

  run(inputs: NodeInputs, output: NodeOutputCallback, signal: NodeSignalCallback) {
    let instance = this.registry.instantiate(this.path);

    instance.onOutput.subscribe(profile => output(profile.output.output, profile.output.data));
    instance.onSignal.subscribe(profile => signal(profile.signal));
    instance.onError.subscribe(error => this.error(error));

    instance.control.activate();
    for (let entry of Object.entries(inputs)) {
      instance.inputs.get(entry[0]).receive(entry[1]);
    }
  }
}

export default function(path: string, inputs: NodeInputs = {}, registry: NodeRegistry = _registry) {
  return new Promise((resolve, reject) => {
    try {
      let call = new Call(path, registry);

      call.onOutput.subscribe(profile => resolve(profile.output));
      call.onSignal.subscribe(profile => resolve(profile.signal));
      call.onError.subscribe(reject);

      call.control.activate();
      call.inputs.entries.forEach(input => {
        if (!(input.tag in inputs)) throw new Error(`bad input, ${input.tag} is missing from ${inputs}`);
        input.pin.receive(inputs[input.tag]);
      });
    } catch (error) { reject(error); }
  });
}
