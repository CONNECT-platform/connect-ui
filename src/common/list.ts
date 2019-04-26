import { HTMLComponent } from '../renderer/html/component';
import { Context } from '../renderer/context';
import component from '../renderer/decorator';

//
// TODO: write tests for this.
//
@component('for', {
  inputs: ['items'],
})
class ListComponent extends HTMLComponent {
  last: any[] = undefined;
  proxied: boolean = false;

  build() {
    this.expr('e', ['items'], (items: any[]) => {
      if (this.proxied) return;

      let itemkey: string = 'each';
      let indexkey: string = undefined;
      let oddKey: string = undefined;
      let evenKey: string = undefined;
      let firstKey: string = undefined;
      let lastKey: string = undefined;

      if (this.root.getAttribute('each')) itemkey = this.root.getAttribute('each');
      if (this.root.getAttribute('index')) indexkey = this.root.getAttribute('index');
      if (this.root.getAttribute('odd')) oddKey = this.root.getAttribute('odd');
      if (this.root.getAttribute('even')) oddKey = this.root.getAttribute('even');
      if (this.root.getAttribute('first')) oddKey = this.root.getAttribute('first');
      if (this.root.getAttribute('last')) oddKey = this.root.getAttribute('last');

      //
      // TODO: make this generally smarter, so that it doesn't re-render the whole
      //       list in response to minor changes.
      //
      if (this.last != items) {
        if (this.$._current)
          (this.$._current.native as HTMLElement).remove();

        this.last = items;

        this.$._current = this.renderer.render('list:container').on(this.root);

        items.forEach((item, index) => {
          var context = new Context();
          if (this._context) context.inherit(this._context);

          let ctx: any = {};
          ctx[itemkey] = item;

          if (indexkey) ctx[indexkey] = index;
          if (oddKey) ctx[oddKey] = index % 2 == 1;
          if (evenKey) ctx[evenKey] = index % 2 == 0;
          if (firstKey) ctx[firstKey] = index == 0;
          if (lastKey) ctx[lastKey] = index == items.length - 1;

          context.inherit(ctx).apply(this.renderer.renderClone('list:item', this.hooks('@')[0]).on(this.$._current));
        });
      }
    });
  }

  render() {
    this.renderer.virtualHook('@');
  }

  wire() {
    this.in.get('items').connect(this.children.e.inputs.get('items'));
  }

  proxy(core: ListComponent): ListComponent {
    this.proxied = true;
    if (this.last) core.inputs.get('items').receive(this.last);
    return super.proxy(core) as ListComponent;
  }
}

export default ListComponent;
