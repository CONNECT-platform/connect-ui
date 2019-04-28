import { HTMLComponent } from '../../renderer/html/component';
import { HTMLNode } from '../../renderer/html/node';
import { Signature, extend } from '../../core/base/signature';
import { RendererType } from '../../renderer/types';

//
// TODO: write tests for this.
//
export class BaseInputComponent extends HTMLComponent {
  constructor(signature: Signature, renderer: RendererType<HTMLNode>, node: HTMLNode) {
    super(extend(signature, {
      inputs: ['value'],
      outputs: ['value']
    }), renderer, node);
  }

  set(_: any) {}
  get(): any {}

  build() {
    this.expr('o', ['event'], () => {
      return this.get();
    });

    this.expr('i', ['value'], value => {
      this.set(value);
    });
  }

  wire() {
    ['keyup','keypress','keydown','blur','focus','change']
      .forEach(event => {
        this.root.outputs.get(event).connect(this.children.o.inputs.get('event'));
      });

    this.children.o.outputs.get('result').connect(this.out.get('value'));
    this.in.get('value').connect(this.children.i.inputs.get('value'));
    this.in.get('value').connect(this.out.get('value'));
  }
}
