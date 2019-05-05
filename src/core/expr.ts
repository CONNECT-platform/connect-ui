import { OutputPin } from './base/io';
import { Node, NodeInputs, NodeOutputCallback } from './base/node';


export type ExprFunction = (...inputs: any[]) => any;

export class Expr extends Node {
  constructor(inputs: string[], private expr: ExprFunction, private context?: any) {
    super({inputs: inputs, outputs: ['result']});
  }

  run(inputs: NodeInputs, output: NodeOutputCallback) {
    try {
      let res = this.expr.apply(undefined,
                  this.inputs.entries
                    .map(entry => inputs[entry.tag])
                    .concat([
                      (error: string | Error) => this.error(error),
                      Object.assign({}, this.context)
                    ]));

      if (typeof res === 'function') {
        if (res.length == 0) output('result', res());
        else if (res.length == 1) res((val: any) => output('result', val));
        else output('result', res);
      }
      else
        output('result', res);
    } catch(error) { this.error(error); }
  }

  public get result(): OutputPin<any> { return this.output('result'); }
}
