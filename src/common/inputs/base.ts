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

  _value: any;

  set(_: any) {}
  get(): any {}

  private _set(_: any) {
    if (this.proxied)
      this._value = _;
    else
      this.set(_);
  }

  private _get(): any {
    if (this.proxied)
      return this._value;
    else
      return this.get();
  }

  build() {
    this.expr('o', ['event'], () => {
      return this._get();
    });

    this.expr('i', ['value'], value => {
      this._set(value);
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

  //
  // TODO: check to which extent this is still necessary.
  //
  proxy(component: BaseInputComponent) {
    if (!this.proxied) {
      this._value = this.get();
    }

    super.proxy(component);

    component.outputs.get('value').onSent.subscribe(value => {
      this._set(value);
      this.outputs.get('value').send(value);
    });

    return this;
  }
}
