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

  constructor(readonly signature: Signature) {
    super();

    if (signature.inputs) signature.inputs.map(input => this.inputs.attach(input, this.createInput(input)));
    if (signature.outputs) signature.outputs.map(output => this.outputs.attach(output, this.createOutput(output)));
    if (signature.signals) signature.signals.map(signal => this.signals.attach(signal, this.createSignal(signal)));
    this.control = this.createControl();

    this.inputs.lock();
    this.outputs.lock();
    this.signals.lock();
  }

  protected createInput(input: string): InputPin<any> { return new InputPin(); }
  protected createOutput(output: string): OutputPin<any> { return new OutputPin(); }
  protected createSignal(signal: string): SignalPin { return new SignalPin(); }
  protected createControl(): ControlPin { return new ControlPin(); }
}
