import { Agent } from './base/agent';
import { InputPin } from './base/io';
import { SignalPin } from './base/control';


export class Relay extends Agent {
  constructor() {
    super({inputs: ['in'], signals: ['out']});
  }

  protected bind() {
    this.in.onActivated.subscribe(() => this.out.activate());
    this.control.onActivated.subscribe(() => this.out.activate());
  }

  public get in(): InputPin<any> { return this.inputs.get('in'); }
  public get out(): SignalPin { return this.signals.get('out'); }
}
