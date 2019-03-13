import { HTMLNode } from './renderer/html/node';
import { HTMLRenderer } from './renderer/html/renderer';
import { AbstractComponent } from './renderer/component';
import { RendererType } from './renderer/types';
import registry from './renderer/component-registry';


/*
<@x></@x>
<hr/>
<p>hellow</p>
<@x></@x>
*/
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

/*
<A>
  <div @x>
    <@y></@y>
  </div>
</A>
*/
class B extends AbstractComponent<HTMLNode> {
  constructor(renderer: RendererType<HTMLNode>, node: HTMLNode) {
    super({}, renderer, node);
  }

  render() {
    this.$.A = this.renderer.render('A').on(this.root);
    this.$.div = this.renderer.render('div').attr('@x').on(this.$.A);
    this.renderer.render('@y').on(this.$.div);
  }

  clone(node: HTMLNode) {
    return new B(this.renderer, node);
  }
}

/*
<B>
  <div @y hellow="world">
    <h1 A="B">hellow</h1>
  </div>
</B>
*/
class D extends AbstractComponent<HTMLNode> {
  constructor(renderer: RendererType<HTMLNode>, node: HTMLNode) {
    super({
      outputs: ['clicked']
    }, renderer, node);
  }

  render() {
    this.$.D = this.renderer.render('B').on(this.root);
    this.$.holder = this.renderer.render('div').attr('@y').attr('hellow', 'world').on(this.$.D);
    this.$.title = this.renderer.render('h1').text('hellow').attr('A', 'B').on(this.$.holder);
  }

  wire() {
    this.$.title.outputs.get('click').connect(this.out.get('clicked'));
  }

  clone(node: HTMLNode) {
    return new D(this.renderer, node);
  }
}

registry.register('A', (renderer:HTMLRenderer, node:HTMLNode) => new A(renderer, node));
registry.register('B', (renderer:HTMLRenderer, node:HTMLNode) => new B(renderer, node));
registry.register('D', (renderer:HTMLRenderer, node:HTMLNode) => new D(renderer, node));

window.addEventListener('load', () => {
  let root = new HTMLNode(document.body);
  let R = new HTMLRenderer();
  let d = R.render('D').on(root);
  (d.component as D).outputs.get('clicked').onSent.subscribe(console.log);
});
