import { should, expect } from 'chai'; should();

import { RenderingComponent } from '../types';
import { ComponentRegistry } from '../component-registry';
import _registry from '../component-registry';
import { Renderer, RenderingRequest } from '../renderer';
import { DummyRenderer } from '../dummy/renderer';
import { DummyNode } from '../dummy/node';
import { DummyComponent } from '../dummy/component';


describe('Renderer', () => {
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

        host.children[0].attributes().should.include('key');
      });
    });

    describe('.on()', () => {
      it('should render a node with requested tag on given node.', () => {
        let host = new DummyNode('host');
        new DummyRenderer().render('child').on(host);

        host.children.length.should.equal(1);
        host.children[0].name.should.equal('child');
      });

      it('should properly render transcluded stuff.', () => {
        let host = new DummyNode('host');
        let renderer = new DummyRenderer(new ComponentRegistry());
        renderer.registry.register('dummy', () => new DummyComponent());

        let d = renderer.render('dummy').on(host)
        let c = d.component;
        let cr = renderer.within(c);
        let A = cr.render('A').on(d);
        cr.render('@x').on(A);
        let B = cr.render('B').on(d);
        cr.render('@x').on(B);
        cr.render('@y').on(B);

        renderer.render('a').attr('@x').attr('attr', 'hellow').on(d);
        renderer.render('b').attr('@y').text('oh my ...').on(d);
        renderer.render('c').attr('@y').on(d);

        d.children.length.should.equal(2);
        d.children[0].name.should.equal('A');
        d.children[1].name.should.equal('B');

        d.children[0].children.length.should.equal(1);
        d.children[0].children[0].name.should.equal('@x');

        d.children[0].children[0].children.length.should.equal(1);
        d.children[0].children[0].children[0].name.should.equal('a');
        d.children[0].children[0].children[0].attrs['attr'].should.equal('hellow');

        d.children[1].children.length.should.equal(2);
        d.children[1].children[0].name.should.equal('@x');
        d.children[1].children[1].name.should.equal('@y');

        d.children[1].children[0].children.length.should.equal(1);
        d.children[1].children[0].children[0].name.should.equal('a');
        d.children[1].children[0].children[0].attrs['attr'].should.equal('hellow');

        d.children[1].children[1].children.length.should.equal(2);
        d.children[1].children[1].children[0].name.should.equal('b');
        d.children[1].children[1].children[0].textContent.should.equal('oh my ...');
        d.children[1].children[1].children[1].name.should.equal('c');
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
      new DummyRenderer().within(undefined).should.be.instanceOf(Renderer);
    });

    it('should return a renderer that calls the `hook()` function on parameter passed to it if it exists and when it is rendering a tag startign with `"@"`.', done => {
      new DummyRenderer().within(<RenderingComponent<DummyNode>>{
        clone() { return this; },
        hook(_, __) {
          done();
          return this;
        }
      }).render('@a').on(new DummyNode('x'));
    });

    it('should pass the proper tag name and node to the hook function.', done => {
      new DummyRenderer().within(<RenderingComponent<DummyNode>>{
        clone() { return this; },
        hook(tag, node) {
          tag.should.equal('@a');
          node.name.should.equal('@a');
          node.attrs.x.should.equal('2');
          done();
          return this;
        }
      }).render('@a').attr('x', '2').on(new DummyNode('x'));
    });
  });
});
