import { Observable } from 'rxjs/Observable';

import { Agent } from './agent';
import { Signature } from './signature';
import { AllGate } from './control';

export type NodeInputs = {[input: string]: any};
export type NodeOutputCallback = (output: string, data: any) => void;
export type NodeSignalCallback = (signal: string) => void;

export type NodeOutput = {output: string; data: any};
export type NodeSignal = string;

export interface NodeExecutionProfile {
  inputs: NodeInputs;
  output?: NodeOutput;
  signal?: NodeSignal;
  error?: string | Error;
}

export abstract class Node extends Agent {
  constructor(signature: Signature) {
    super(signature);
  }

  protected preBuild() {
    this._def<NodeExecutionProfile>('run');
    this._def<NodeExecutionProfile>('output');
    this._def<NodeExecutionProfile>('signal');
  }

  protected bind() {
    this.inputs.entries.map(entry => entry.pin.onActivated.subscribe(() => this._checkRun()));
    this.control.onActivated.subscribe(() => this._checkRun());
  }

  private _checkRun() {
    if (this.inputs.entries.some(entry => !entry.pin.activated)) return;
    if (this.control.connections.length > 0 && !this.control.activated) return;

    let profile = <NodeExecutionProfile> {
      inputs: []
    }

    profile.inputs = this.inputs.entries.reduce((all, entry) => {
      all[entry.tag] = entry.pin.last;
      return all;
    }, profile.inputs);

    let output = (output: string, data: any) => {
      if (this.outputs.has(output)) {
        this.outputs.get(output).send(data);
        profile.output = {output, data};
        this._emit('output', profile);
      }
      else this.error(`unrecognized output: ${output}`);
    };

    let signal = (signal: string) => {
      if (this.signals.has(signal)) {
        this.signals.get(signal).activate();
        profile.signal = signal;
        this._emit('signal', profile);
      }
      else this.error(`unrecognized signal: ${signal}`);
    };

    this.control.reset();
    this._emit('run', profile);
    (async() => {
      try {
        await this.run(profile.inputs, output, signal);
      } catch(error) {
        this.error(error);
      }
    })();
  }

  protected abstract run(
    inputs: NodeInputs,
    output: NodeOutputCallback,
    signal?: NodeSignalCallback
  ): any;

  protected createControl() { return new AllGate(); }

  public get onRun(): Observable<NodeExecutionProfile> { return this.on('run'); }
  public get onOutput(): Observable<NodeExecutionProfile> { return this.on('output'); }
  public get onSignal(): Observable<NodeExecutionProfile> { return this.on('signal'); }
}
