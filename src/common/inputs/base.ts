import { HTMLComponent } from '../../renderer/html/component';
import { HTMLNode } from '../../renderer/html/node';
import { Signature, extend } from '../../core/base/signature';
import { RendererType } from '../../renderer/types';
import { Context } from '../../renderer/context';
import { Resource } from '../../core/resource';

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

  bound: Resource<any>;

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
        this.root.output(event).connect(this.children.o.input('event'));
      });

    this.children.o.output('result').connect(this.out('value'));

    this.children.value.output('out').connect(this.children.i.input('value'));
    this.in('value').connect(this.children.value.input('in'));
    this.in('value').connect(this.out('value'));
  }

  context(ctx: Context) {
    super.context(ctx);

    if (this.root.attributes.includes('bind')) {
      let val = this._context.get(this.root.getAttr('bind'));

      if (val !== undefined) {
        if (this.bound) {
          this.bound.out.disconnect(this.input('value'));
          this.bound.in.disconnect(this.output('value'));
          this.bound = undefined;
        }

        if (val instanceof Resource) {
          this.bound = val;
          this.bound.out.connect(this.input('value'));
          this.bound.in.connect(this.output('value'));
        }
      }
    }

    return this;
  }
}
