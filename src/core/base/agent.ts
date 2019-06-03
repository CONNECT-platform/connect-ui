import { Observable } from 'rxjs/Observable';

import { Topic } from './topic';
import { Signature } from './signature';
import { PinMap } from './pinmap';
import { InputPin, OutputPin } from './io';
import { SignalPin, ControlPin } from './control';


export class Agent extends Topic {
  readonly inputs: PinMap<InputPin<any>> = new PinMap<InputPin<any>>();
  readonly outputs: PinMap<OutputPin<any>> = new PinMap<OutputPin<any>>();
  readonly signals: PinMap<SignalPin> = new PinMap<SignalPin>();
  readonly control: ControlPin;

  private _proxied: boolean = false;

  constructor(readonly signature: Signature = {}, preBuildCallback?: (_: any) => void) {
    super();

    this._def<void>('reset');
    this._def<Error>('error');
    this._def<Agent>('proxied');

    if (preBuildCallback) preBuildCallback(this);
    this.preBuild();

    if (signature.inputs) signature.inputs.map(input => this.inputs.attachLazy(input, () => this.createInput(input)));
    if (signature.outputs) signature.outputs.map(output => this.outputs.attachLazy(output, () => this.createOutput(output)));
    if (signature.signals) signature.signals.map(signal => this.signals.attachLazy(signal, () => this.createSignal(signal)));
    this.control = this.createControl();

    this.inputs.lock();
    this.outputs.lock();
    this.signals.lock();

    this.bind();
  }

  public reset(): Agent {
    // TODO: refactor
    this.inputs.entries.map(entry => entry.pin.reset());
    this.outputs.entries.map(entry => entry.pin.reset());
    this.signals.entries.map(entry => entry.pin.reset());
    this.control.reset();

    return this._emit('reset') as Agent;
  }

  //
  // TODO: send the last data on each input and the control to the newly proxied agent.
  // TODO: write tests for this behavior.
  //
  public proxy(core: Agent): Agent {
    this.control.onActivated.subscribe(() => core.control.activate());

    this.inputs.proxy(core.inputs);
    core.outputs.proxy(this.outputs);
    core.signals.proxy(this.signals);

    this._proxied = true;
    return this._emit('proxied', core) as Agent;
  }

  protected get proxied(): boolean {
    return this._proxied;
  }

  public cleanup() {
    super.cleanup();
    this.inputs.cleanup();
    this.outputs.cleanup();
    this.signals.cleanup();
    this.control.cleanup();
  }

  public input(tag: string) { return this.inputs.get(tag); }
  public output(tag: string) { return this.outputs.get(tag); }
  public signal(tag: string) { return this.signals.get(tag); }

  protected bind(): void {}
  protected preBuild(): void {}

  protected createInput(input: string): InputPin<any> { return new InputPin(); }
  protected createOutput(output: string): OutputPin<any> { return new OutputPin(); }
  protected createSignal(signal: string): SignalPin { return new SignalPin(); }
  protected createControl(): ControlPin { return new ControlPin(); }

  protected error(error: string | Error): Agent {
    if (typeof error === 'string') error = new Error(error);
    return this._emit('error', error) as Agent;
  }

  public get onReset(): Observable<void> { return this.on('reset'); }
  public get onError(): Observable<Error> { return this.on('error'); }
  public get onProxied(): Observable<Agent> { return this.on('proxied'); }
}
