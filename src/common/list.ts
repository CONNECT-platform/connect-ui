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
          // TODO: enable naming context variables.
          //
          context.inherit({
            item: item,
            index: index
          }).apply(this.renderer.renderClone('list:item', this.hooks('@')[0]).on(this.$._current));
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
