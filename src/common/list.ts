import { HTMLComponent } from '../renderer/html/component';
import { Context } from '../renderer/context';
import component from '../renderer/decorator';

import { Resource } from '../core/resource';

//
// TODO: write tests for this.
//
@component('for', {
  inputs: ['items'],
})
class ListComponent extends HTMLComponent {
  bound: Resource<any[]>;

  build() {
    this.state('items');
    this.expr('e', ['items'], (items: any[]) => {
      let itemkey: string = 'each';
      let indexkey: string = undefined;
      let oddKey: string = undefined;
      let evenKey: string = undefined;
      let firstKey: string = undefined;
      let lastKey: string = undefined;

      if (this.root.getAttribute('each')) itemkey = this.root.getAttribute('each');
      if (this.root.getAttribute('index')) indexkey = this.root.getAttribute('index');
      if (this.root.getAttribute('odd')) oddKey = this.root.getAttribute('odd');
      if (this.root.getAttribute('even')) evenKey = this.root.getAttribute('even');
      if (this.root.getAttribute('first')) firstKey = this.root.getAttribute('first');
      if (this.root.getAttribute('last')) lastKey = this.root.getAttribute('last');

      //
      // TODO: make this generally smarter, so that it doesn't re-render the whole
      //       list in response to minor changes.
      //
      if (this.$._current) {
        this.$._current.cleanup();
        (this.$._current.native as HTMLElement).remove();
      }

      this.$._current = this.renderer.render('list:container').on(this.root);

      items.forEach((item, index) => {
        var context = new Context();
        if (this._context) context.inherit(this._context);

        let ctx: any = {};
        ctx[itemkey] = item;

        if (indexkey) ctx[indexkey] = index;
        if (oddKey) ctx[oddKey] = index % 2 == 1;
        if (evenKey) ctx[evenKey] = index % 2 == 0;
        if (firstKey) ctx[firstKey] = (index == 0);
        if (lastKey) ctx[lastKey] = (index == items.length - 1);

        let n = this.renderer.renderClone('list:item', this.getHook('@')).on(this.$._current);

        context.inherit(ctx);
        context.apply(n);

        //
        // TODO: study why this is required.
        //
        setImmediate(() => {
          context.apply(n);
        });
      });
    });
  }

  render() {
    this.renderer.virtualHook('@');
  }

  wire() {
    this.in.get('items').connect(this.children.items.inputs.get('in'));
    this.children.items.outputs.get('out').connect(this.children.e.inputs.get('items'));
  }

  context(ctx: Context) {
    super.context(ctx);

    if (this.root.attributes.includes('of')) {
      let val = this._context.get(this.root.getAttr('of'));

      if (val !== undefined) {
        if (this.bound) {
          this.bound.out.disconnect(this.inputs.get('items'));
          this.bound = undefined;
        }

        if (val instanceof Resource) {
          this.bound = val;
          this.inputs.get('items').connect(this.bound.out);
        }
        else {
          this.inputs.get('items').receive(val);
        }
      }
    }

    return this;
  }
}

export default ListComponent;
