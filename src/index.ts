import { HTMLNode } from './renderer/html/node';
import { HTMLRenderer } from './renderer/html/renderer';
import { AbstractComponent } from './renderer/component';
import { RendererType } from './renderer/types';
import registry from './renderer/component-registry';
import render from './compiler/html/decorator';


@render(require('./test/templates/a.component.html'))
class A extends AbstractComponent<HTMLNode> {
  constructor(renderer: RendererType<HTMLNode>, node: HTMLNode) {
    super({}, renderer, node);
  }

  clone(node: HTMLNode) {
    return new A(this.renderer, node);
  }
}


@render(require('./test/templates/b.component.html'))
class B extends AbstractComponent<HTMLNode> {
  constructor(renderer: RendererType<HTMLNode>, node: HTMLNode) {
    super({}, renderer, node);
  }

  clone(node: HTMLNode) {
    return new B(this.renderer, node);
  }
}


@render(require('./test/templates/d.component.html'))
class D extends AbstractComponent<HTMLNode> {
  constructor(renderer: RendererType<HTMLNode>, node: HTMLNode) {
    super({
      outputs: ['clicked']
    }, renderer, node);
  }

  wire() {
    this.$.title.outputs.get('click').connect(this.out.get('clicked'));
  }

  clone(node: HTMLNode) {
    return new D(this.renderer, node);
  }
}

registry.register('a', (renderer:HTMLRenderer, node:HTMLNode) => new A(renderer, node));
registry.register('b', (renderer:HTMLRenderer, node:HTMLNode) => new B(renderer, node));
registry.register('d', (renderer:HTMLRenderer, node:HTMLNode) => new D(renderer, node));

try {
  window.addEventListener('load', () => {
    let root = new HTMLNode(document.body);
    let R = new HTMLRenderer();
    let d = R.render('d').on(root);
    (d.component as D).outputs.get('clicked').onSent.subscribe(console.log);
  });
} catch(err) {}
