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

    for (let entry of Object.entries(inputs)) {
      instance.inputs.get(entry[0]).receive(entry[1]);
    }
  }
}
