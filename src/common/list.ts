import { HTMLComponent } from '../renderer/html/component';
import { HTMLNode } from '../renderer/html/node';
import component from '../renderer/decorator';

//
// TODO: write tests for this.
//
@component('list', {
  inputs: ['items'],
})
class ConditionalComponent extends HTMLComponent {
  last: any[] = undefined;

  private _provide(item:any, index:number, node: HTMLNode) {
    node.attributes
      .filter(attr => attr.startsWith('each:'))
      .forEach(attr => {
        let steps = attr.split(':');
        let provide = (value: any) => {}

        if (steps.length == 2) {
          if (steps[1] == 'text')
            provide = (value: any) => node.text(value);
          else
            provide = (value: any) => node.attr(steps[1], value);
        }
        else {
          //
          // TODO: support feeding to components.
          //
          console.error(`ERROR:: unrecognized list directive "${attr}"`);
        }

        let value = node.getAttribute(attr);
        if (value == 'index')
          provide(index);
        else if (value == 'item') {
          //
          // TODO: add support for getting nested values in item.
          // TODO: add support for aliasing "item" to something more meaningful to context.
          //
          provide(item);
        }
        else {
          console.error(`ERROR:: unrecognized list value "${attr}='${value}'"`);
        }
      });
    //
    // TODO: add support for providing iteration values to component if present and supporting
    //       proper inputs without specification.
    //
    if (!node.component)
      node.children.forEach(child => this._provide(item, index, child));
  }

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
          let node = this.renderer.renderClone('list:item', this.hooks('@')[0]).on(this.$._current);
          node.children.forEach(child => this._provide(item, index, child));
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

export default ConditionalComponent;
