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
    this.state('value');

    this.expr('o', ['event'], () => {
      if (!this.proxied)
        return this.get();
    });

    this.expr('i', ['value'], value => {
      if (!this.proxied) {
        this.set(value);
        return value;
      }
    });
  }

  wire() {
    ['keyup','keypress','keydown','change']
      .forEach(event => {
        this.root.outputs.get(event).connect(this.children.o.inputs.get('event'));
      });

    // this.children.o.outputs.get('result').connect(this.children.value.inputs.get('in'));
    this.children.o.outputs.get('result').connect(this.out.get('value'));

    this.children.value.outputs.get('out').connect(this.children.i.inputs.get('value'));
    this.in.get('value').connect(this.children.value.inputs.get('in'));
    this.in.get('value').connect(this.out.get('value'));
  }
}
