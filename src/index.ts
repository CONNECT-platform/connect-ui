import { InputPin, OutputPin } from './core/base/io';
import './core/composite';
import { HTMLNode } from './renderer/html/node';
import { HTMLRenderer } from './renderer/html/renderer';
import { Component } from './renderer/component';
import registry from './renderer/component-registry';


class D extends Component {
  constructor(node: HTMLNode, renderer: HTMLRenderer) {
    super({
      outputs: ['clicked']
    }, node, renderer);
  }

  render() {
    this.$.holder = this.renderer.render('div').on(this.root);
    this.$.title = this.renderer.render('h1').text('hellow').attr('A', 'B').on(this.$.holder);
  }

  wire() {
    this.$.title.outputs.get('click').connect(this.out.get('clicked'));
  }

  _clone(node: HTMLNode) {
    return new D(node, this.renderer as any);
  }
}

registry.register('D', (renderer:HTMLRenderer, node:HTMLNode) => new D(node, renderer));

window.addEventListener('load', () => {
  let root = new HTMLNode(document.body);
  let R = new HTMLRenderer();
  let d = R.render('D').on(root);
  (d.component as Component).outputs.get('clicked').onSent.subscribe(console.log);
});
