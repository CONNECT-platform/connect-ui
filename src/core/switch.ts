import { Node, NodeInputs, NodeOutputCallback, NodeSignalCallback } from './base/node';
import { SignalPin } from './base/control';
import { InputPin } from './base/io';
import { PinMap } from './base/pinmap';


export type SwitchCaseType = string | number | boolean | null | undefined;

export class Switch extends Node {
  private static transform(value: SwitchCaseType): string {
    if (value === '...') return value;
    else if (typeof value === 'string') return '"' + value;
    else if (typeof value === 'number') return value.toString();
    else if (typeof value === 'boolean') return value.toString();
    else if (value === null) return 'null';
    else if (value === undefined) return 'undefined';
    else throw new Error(`Switch does not accept cases of type ${typeof value}. Cases should be one of string | number | boolean | null | undefined.`);
  }

  readonly default: SignalPin;

  constructor(cases: SwitchCaseType[]) {
    super({inputs: ['target'], signals: cases.map(Switch.transform)});
    this.default = this.case('...');
  }

  run(inputs: NodeInputs, _: NodeOutputCallback, signal: NodeSignalCallback) {
    let value = Switch.transform(inputs.target);
    if (this.cases.has(value)) signal(value);
    else if (this.default) signal('...');
    else this.error(`unrecognized case: ${value}`);
  }

  public get target(): InputPin<any> { return this.input('target'); }
  public case(value: any): SignalPin { return this.signal(Switch.transform(value)); }
  public get cases(): PinMap<SignalPin> { return this.signals; }
}
