import { HTMLComponent } from '../renderer/html/component';

import component from '../renderer/decorator';
import { Context } from '../renderer/context';

import { Resource } from '../core/resource';

//
// TODO: write tests for this.
// TODO: switch the behavior to merely not display contents instead of rerendering clonse of them each time.
//
@component('if', {
  inputs: ['condition'],
})
class ConditionalComponent extends HTMLComponent {
  last: boolean | 'not set' = 'not set';
  bound: Resource<true>;

  build() {
    this.expr('e', ['switch'], (_switch) => {
      if (this.last === 'not set' || this.last !== _switch) {
        (this.root.native as HTMLElement).innerHTML = "";
        if (this.$._current) {
          (this.$._current.native as HTMLElement).remove();
        }

        if (_switch)
          this.$._current = this.getHook('@then');
        else
          this.$._current = this.getHook('@else');

        this.root.appendChild(this.$._current);
        this._context.apply(this.$._current);
        this.last = !!_switch;
      }
    });
  }

  render() {
    this.renderer.virtualHook('@then');
    this.renderer.virtualHook('@else');
  }

  wire() {
    this.in('condition').connect(this.children.e.input('switch'));
  }

  context(ctx: Context) {
    super.context(ctx);

    if (this.root.attributes.includes('condition')) {
      let value = this._context.get(this.root.getAttr('condition'));
      if (value !== undefined) {
        if (this.bound)
          this.bound.out.disconnect(this.input('condition'));

        if (value instanceof Resource) {
          this.bound = value;
          this.bound.out.connect(this.input('condition'));
        }
        else this.input('condition').receive(value);
      }
    }

    return this;
  }
}

export default ConditionalComponent;
