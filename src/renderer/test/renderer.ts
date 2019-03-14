import { should, expect } from 'chai'; should();

import { RenderingComponent } from '../types';
import { ComponentRegistry } from '../component-registry';
import _registry from '../component-registry';
import { AbstractRenderer, RenderingRequest } from '../renderer';
import { DummyRenderer } from '../dummy/renderer';
import { DummyNode } from '../dummy/node';
import { DummyComponent } from '../dummy/component';


describe('AbstractRenderer', () => {
  describe('.render()', () => {
    it('should return a rendering request.', () => {
      new DummyRenderer().render('A').should.be.instanceOf(RenderingRequest);
    });

    it('should invoke a component factory if renderer\'s component registry has one for given tag.', done => {
      let r = new ComponentRegistry();
      r.register('A', () => { done(); return undefined; } );
      new DummyRenderer(r).render('A');
    });

    it('should pass the proper node to the component factory.', done => {
      let r = new ComponentRegistry();
      r.register('A', (_, node: DummyNode) => {
        node.name.should.equal('A');
        done(); return undefined;
      });
      new DummyRenderer(r).render('A');
    });

    it('should pass a proper renderer to the component factory.', () => {
      let r = new DummyRenderer(new ComponentRegistry());

      r.registry.register('D', (renderer, node) => {
        renderer.render('A').on(node);
        return undefined;
      });

      r.registry.register('A', (renderer, node) => {
        renderer.render('B').on(node);
        renderer.render('C').on(node);
        return undefined;
      });


      let host = new DummyNode('host');
      r.render('D').on(host);
      host.children[0].name.should.equal('D');
      host.children[0].children[0].name.should.equal('A');
      host.children[0].children[0].children[0].name.should.equal('B');
      host.children[0].children[0].children[1].name.should.equal('C');
    });

    describe('.text()', () => {
      it('should set the proper text on the node to be rendered.', () => {
        let host = new DummyNode('host');
        new DummyRenderer().render('child').text('hellow').on(host);

        host.children[0].textContent.should.equal('hellow');
      });
    });

    describe('.attr()', () => {
      it('should set the proper attributes on the node to be rendered.', () => {
        let host = new DummyNode('host');
        new DummyRenderer().render('child').attr('key', 'val').on(host);

        host.children[0].attrs.key.should.equal('val');
      });

      it('should be invokable without a content argument, just setting the attr on the node.', () => {
        let host = new DummyNode('host');
        new DummyRenderer().render('child').attr('key').on(host);

        host.children[0].attributes.should.include('key');
      });

      it('should call the `.trans()` function on the node if the attribute starts with "hook:".', done => {
        class _N extends DummyNode {
          trans(tag: string) {
            tag.should.equal('hook:hellow');
            done();
            return this;
          }
        }

        class _NR extends DummyRenderer {
          createNode(tag: string) {
            return new _N(tag);
          }
        }

        new _NR().render('child').attr('hook:hellow').on(new _N('host'));
      });

      it('should ignore the attribute starting with "hook:" if the node doesn\'t have a `.trans()` function.', () => {
        let node = new DummyRenderer().render('child').attr('hook:hellow').on(new DummyNode('host'));
        node.attributes.length.should.equal(0);
      });
    });

    describe('.on()', () => {
      it('should render a node with requested tag on given node.', () => {
        let host = new DummyNode('host');
        new DummyRenderer().render('child').on(host);

        host.children.length.should.equal(1);
        host.children[0].name.should.equal('child');
      });

      it('should utilize the node\'s `.trans()` value when the function exists to find proper transclusion hooks.', () => {
        class _N extends DummyNode {
          transtag() { return 'hook:yo'; }
        }

        class _NR extends DummyRenderer {
          createNode(tag: string) {
            return new _N(tag);
          }
        }

        let renderer = new _NR(new ComponentRegistry());
        renderer.registry.register('dummy', () => new DummyComponent());
        let d = renderer.render('dummy').on(new _N('host'));

        renderer.within(d.component).render('hook:yo').on(d);
        renderer.render('something').on(d);
        d.children[0].children[0].name.should.equal('something');
      });

      it('should properly render a transculded node on a transculsion hook.', () => {
        let host = new DummyNode('host');
        let renderer = new DummyRenderer(new ComponentRegistry());
        renderer.registry.register('dummy', () => new DummyComponent());
        let d = renderer.render('dummy').on(host);
        let cr = renderer.within(d.component);

        let A = cr.render('A').on(d);
        cr.render('hook:x').on(A);

        renderer.render('a').attr('hook:x').on(d);

        d.children[0].children[0].children[0].name.should.equal('a');
      });

      it('should properly handle multiple transclusion hooks.', () => {
        let host = new DummyNode('host');
        let renderer = new DummyRenderer(new ComponentRegistry());
        renderer.registry.register('dummy', () => new DummyComponent());
        let d = renderer.render('dummy').on(host);
        let cr = renderer.within(d.component);

        let A = cr.render('A').on(d);
        cr.render('hook:x').on(A);
        cr.render('hook:y').on(d);

        renderer.render('a').attr('hook:x').on(d);
        renderer.render('b').attr('hook:y').on(d);

        d.children[0].children[0].children[0].name.should.equal('a');
        d.children[1].children[0].name.should.equal('b');
      });

      it('should render multiple copies of a given transcluded node on each hook.', () => {
        let host = new DummyNode('host');
        let renderer = new DummyRenderer(new ComponentRegistry());
        renderer.registry.register('dummy', () => new DummyComponent());
        let d = renderer.render('dummy').on(host);
        let cr = renderer.within(d.component);

        cr.render('hook:x').on(d);
        cr.render('hook:x').on(cr.render('A').on(d));

        renderer.render('a').attr('hook:x').on(d);

        d.children[0].children[0].name.should.equal('a');
        d.children[1].children[0].children[0].name.should.equal('a');
        d.children[0].children[0].should.not.equal(d.children[1].children[0].children[0]);
      });

      it('should properly transfer the attributes and text content of all transcluded nodes.', () => {
        let host = new DummyNode('host');
        let renderer = new DummyRenderer(new ComponentRegistry());
        renderer.registry.register('dummy', () => new DummyComponent());
        let d = renderer.render('dummy').on(host);
        let cr = renderer.within(d.component);

        cr.render('hook:x').on(d);
        cr.render('hook:x').on(cr.render('A').on(d));

        renderer.render('a').attr('hook:x').attr('hellow', 'world').text('some text').on(d);

        d.children[0].children[0].attrs['hellow'].should.equal('world');
        d.children[0].children[0].textContent.should.equal('some text');
        d.children[1].children[0].children[0].textContent.should.equal('some text');
      });

      it('should render multiple nodes with a given transclusion tag on the hook(s) properly.', () => {
        let host = new DummyNode('host');
        let renderer = new DummyRenderer(new ComponentRegistry());
        renderer.registry.register('dummy', () => new DummyComponent());
        let d = renderer.render('dummy').on(host);
        let cr = renderer.within(d.component);

        cr.render('hook:x').on(d);
        cr.render('hook:x').on(cr.render('A').on(d));

        renderer.render('a').attr('hook:x').on(d);
        renderer.render('b').attr('hook:x').on(d);

        d.children[0].children.length.should.equal(2);
        d.children[1].children[0].children[1].name.should.equal('b');
      });

      it('should render nodes with no transclusion tag on the `hook::` hook.', () => {
        let host = new DummyNode('host');
        let renderer = new DummyRenderer(new ComponentRegistry());
        renderer.registry.register('dummy', () => new DummyComponent());
        let d = renderer.render('dummy').on(host);
        let cr = renderer.within(d.component);

        cr.render('hook:x').on(d);
        cr.render('hook::').on(cr.render('A').on(d));

        renderer.render('a').attr('hook:x').on(d);
        renderer.render('b').on(d);

        d.children[0].children[0].name.should.equal('a');
        d.children[1].children[0].children[0].name.should.equal('b');
      });

      it('should ignore nodes with mis-matching transclusion tag.', () => {
        let host = new DummyNode('host');
        let renderer = new DummyRenderer(new ComponentRegistry());
        renderer.registry.register('dummy', () => new DummyComponent());
        let d = renderer.render('dummy').on(host);
        let cr = renderer.within(d.component);

        cr.render('hook:x').on(d);
        cr.render('hook::').on(d);

        renderer.render('a').attr('hook:y').on(d);

        d.children[0].children.length.should.equal(0);
        d.children[0].children.length.should.equal(0);
      });

      it('should ignore nodes with-out a transclusion tag when `hook::` hook doesn\'t exist.', () => {
        let host = new DummyNode('host');
        let renderer = new DummyRenderer(new ComponentRegistry());
        renderer.registry.register('dummy', () => new DummyComponent());
        let d = renderer.render('dummy').on(host);
        let cr = renderer.within(d.component);

        cr.render('hook:x').on(d);

        renderer.render('a').attr('hook:x').on(d);
        renderer.render('b').on(d);

        d.children[0].children.length.should.equal(1);
        d.children[0].children[0].name.should.equal('a');
        d.children[0].children[0].children.length.should.equal(0);
      });

      it('should properly render subsequent children of a transcluded node.', () => {
        let R = new DummyRenderer(new ComponentRegistry());
        R.registry.register('dummy', () => new DummyComponent());
        let d = R.render('dummy').on(new DummyNode('host'));

        R.within(d.component).render('hook:x').on(d);
        let div = R.render('div').attr('hook:x').on(d);
        R.render('p').on(div);

        d.children[0].children[0].children[0].name.should.equal('p');
      });

      it('should properly handle chain-transclusion.', () => {
        let R = new DummyRenderer(new ComponentRegistry());

        class A extends DummyComponent {
          constructor(R: DummyRenderer, N: DummyNode) {
            super();
            R.within(this).render('hook:x').on(N);
          }
        }

        class B extends DummyComponent {
          constructor(R: DummyRenderer, N: DummyNode) {
            super();
            R = R.within(this);
            let A = R.render('A').on(N);
            let div = R.render('div').attr('hook:x').on(A);
            R.render('hook:y').on(div);
          }
        }

        R.registry.register('A', (R:DummyRenderer, N:DummyNode) => new A(R, N));
        R.registry.register('B', (R:DummyRenderer, N:DummyNode) => new B(R, N));

        let b = R.render('B').on(new DummyNode('host'));
        let s = R.render('section').attr('hook:y').on(b);
        R.render('p').on(s);

        b.children[0].children[0].children[0].children[0].children[0].children[0].name.should.equal('p');
      });

      it('should proxy the component of the node that is transcluded.', () => {
        class A extends DummyComponent {
          constructor(R: DummyRenderer, N: DummyNode) {
            super();
            R.within(this).render('hook:x').on(N);
          }
        }

        let R = new DummyRenderer(new ComponentRegistry());
        R.registry.register('A', (R:DummyRenderer, N:DummyNode) => new A(R, N));
        R.registry.register('dummy', () => new DummyComponent());

        let a = R.render('A').on(new DummyNode('host'));
        let d = R.render('dummy').attr('hook:x').on(a);

        (d.component as DummyComponent).proxies[0].should.equal(a.children[0].children[0].component);
      });
    });
  });

  describe('.registry', () => {
    it('should be the component registry given to the renderer on construction.', () => {
      let r = new ComponentRegistry();
      new DummyRenderer(r).registry.should.equal(r);
    });

    it('should be equal to default registry if none provided in constructor.', () => {
      new DummyRenderer().registry.should.equal(_registry);
    });
  });

  describe('.within()', () => {
    it('should return a renderer object.', () => {
      new DummyRenderer().within(undefined).should.be.instanceOf(AbstractRenderer);
    });

    it('should return a renderer that calls the `hook()` function on parameter passed to it if it exists and when it is rendering a tag starting with `"hook:"`.', done => {
      new DummyRenderer().within(<RenderingComponent<DummyNode>>{
        clone() { return this; },
        hook(_, __) {
          done();
          return this;
        }
      }).render('hook:a').on(new DummyNode('x'));
    });

    it('should pass the proper tag name and node to the hook function.', done => {
      new DummyRenderer().within(<RenderingComponent<DummyNode>>{
        clone() { return this; },
        hook(tag, node) {
          tag.should.equal('hook:a');
          node.name.should.equal('hook:a');
          node.attrs.x.should.equal('2');
          done();
          return this;
        }
      }).render('hook:a').attr('x', '2').on(new DummyNode('x'));
    });
  });

  describe('.clone()', () => {
    it('should clone a given node.', () => {
      let r = new DummyRenderer();
      let n = new DummyNode('n');
      let c = r.clone(n);

      c.name.should.equal('n');
    });

    it('should clone the component attached to the node as well and attach it to the cloned node.', () => {
      let r = new DummyRenderer(new ComponentRegistry());
      r.registry.register('n', () => new DummyComponent());
      let n = r.render('n').on(new DummyNode('host'));
      let c = r.clone(n);

      c.component.should.be.instanceof(DummyComponent);
      c.component.should.not.be.equal(n.component);
    });

    it('should clone a node\'s children.', () => {
      let r = new DummyRenderer();
      let n = new DummyNode('n');
      let nn = r.render('nn').on(n);
      r.render('nm').on(n);
      r.render('nnn').on(nn);

      let c = r.clone(n);
      c.children.length.should.equal(2);
      c.children[0].name.should.equal('nn');
      c.children[1].name.should.equal('nm');
      c.children[0].children.length.should.equal(1);
      c.children[0].children[0].name.should.equal('nnn');

      c.children[0].should.not.equal(n.children[0]);
      c.children[0].children[0].should.not.equal(n.children[0].children[0]);
    });

    it('should clone children components as well.', () => {
      let r = new DummyRenderer(new ComponentRegistry());
      r.registry.register('nnn', () => new DummyComponent());

      let n = new DummyNode('n');
      r.render('nnn').on(r.render('nn').on(n));

      let c = r.clone(n);
      c.children[0].children[0].component.should.be.instanceof(DummyComponent);
      c.children[0].children[0].component.should.not.equal(n.children[0].children[0].component);
    });
  });
});
