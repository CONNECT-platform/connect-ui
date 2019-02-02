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

  constructor(readonly signature: Signature = {}) {
    super();

    this._def<void>('reset');
    this._def<Error>('error');

    this.preBuild();

    if (signature.inputs) signature.inputs.map(input => this.inputs.attach(input, this.createInput(input)));
    if (signature.outputs) signature.outputs.map(output => this.outputs.attach(output, this.createOutput(output)));
    if (signature.signals) signature.signals.map(signal => this.signals.attach(signal, this.createSignal(signal)));
    this.control = this.createControl();

    this.inputs.lock();
    this.outputs.lock();
    this.signals.lock();

    this.bind();
  }

  public reset(): Agent {
    this.inputs.entries.map(entry => entry.pin.reset());
    this.outputs.entries.map(entry => entry.pin.reset());
    this.signals.entries.map(entry => entry.pin.reset());
    this.control.reset();

    return this._emit('reset') as Agent;
  }

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
}
