import { HTMLComponent } from '../renderer/html/component';
import { Context } from '../renderer/context';
import component from '../renderer/decorator';

//
// TODO: write tests for this.
//
@component('list', {
  inputs: ['items'],
})
class ListComponent extends HTMLComponent {
  last: any[] = undefined;

  build() {
    this.expr('e', ['items'], (items: any[]) => {
      let itemkey: string = 'item';
      let indexkey: string = undefined;

      if (this.root.getAttribute('foreach')) {
        itemkey = this.root.getAttribute('foreach');
      }

      if (this.root.getAttribute('index')) {
        indexkey = this.root.getAttribute('index');
      }

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

          //
          // TODO: add support for `first`, `last`, `odd`, and `even`.
          //
          let ctx: any = {};
          ctx[itemkey] = item;
          if (indexkey) ctx[indexkey] = index;

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
}

export default ListComponent;
