import { HTMLComponent } from '../renderer/html/component';
import { HTMLNode } from '../renderer/html/node';
import component from '../renderer/decorator';

import './hidden';

//
// TODO: write tests for this.
//
@component('conditional', {
  inputs: ['switch'],
})
class ConditionalComponent extends HTMLComponent {
  last: boolean | 'not set' = 'not set';

  build() {
    this.expr('e', ['switch'], (_switch) => {
      if (this.last === 'not set' || this.last !== _switch) {
        if (this.$._current) {
          (this.$._current.native as HTMLElement).remove();
        }

        if (_switch) {
          this.$._current = this.renderer.renderClone('helper:then', this.hooks('@then')[0]).on(this.root);
        }
        else {
          this.$._current = this.renderer.renderClone('helper:else', this.hooks('@else')[0]).on(this.root);
        }

        this.last = !!_switch;
      }
    });
  }

  render() {
    this.hook('@then', new HTMLNode(document.createElement('hook:then')));
    this.hook('@else', new HTMLNode(document.createElement('hook:else')));
  }

  wire() {
    this.in.get('switch').connect(this.children.e.inputs.get('switch'));
  }
}

export default ConditionalComponent;
