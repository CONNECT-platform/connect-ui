import { HTMLNode } from './renderer/html/node';
import { HTMLRenderer } from './renderer/html/renderer';
import { AbstractComponent } from './renderer/component';
import { RendererType } from './renderer/types';
import registry from './renderer/component-registry';


class A extends AbstractComponent<HTMLNode> {
  constructor(renderer: RendererType<HTMLNode>, node: HTMLNode) {
    super({}, renderer, node);
  }

  render() {
    this.renderer.render('@x').on(this.root);
    this.renderer.render('hr').on(this.root);
    this.renderer.render('p').text('hellow').on(this.root);
    this.renderer.render('@x').on(this.root);
  }

  clone(node: HTMLNode) {
    return new A(this.renderer, node);
  }
}

class D extends AbstractComponent<HTMLNode> {
  constructor(renderer: RendererType<HTMLNode>, node: HTMLNode) {
    super({
      outputs: ['clicked']
    }, renderer, node);
  }

  render() {
    this.$.D = this.renderer.render('A').on(this.root);
    this.$.holder = this.renderer.render('div').attr('@x').attr('hellow', 'world').on(this.$.D);
    this.$.title = this.renderer.render('h1').text('hellow').attr('@x').attr('A', 'B').on(this.$.holder);
  }

  wire() {
    this.$.title.outputs.get('click').connect(this.out.get('clicked'));
  }

  clone(node: HTMLNode) {
    return new D(this.renderer, node);
  }
}

registry.register('A', (renderer:HTMLRenderer, node:HTMLNode) => new A(renderer, node));
registry.register('D', (renderer:HTMLRenderer, node:HTMLNode) => new D(renderer, node));

window.addEventListener('load', () => {
  let root = new HTMLNode(document.body);
  let R = new HTMLRenderer();
  let d = R.render('D').on(root);
  (d.component as D).outputs.get('clicked').onSent.subscribe(console.log);
});
