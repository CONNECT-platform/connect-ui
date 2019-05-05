import { should, expect } from 'chai'; should();

import { Context } from '../context';
import { DummyNode } from '../dummy/node';

import { AbstractNode } from '../node';
import { AbstractComponent } from '../component';


class _N extends AbstractNode<_N> {
  constructor() {
    super([]);
    this.postConstruct();
  }

  appendChild(_: _N) {}
  clone() { return this; }
  getText() { return ''; }
  setText(_: string) {}

  _attrs : {[key: string]: string} = {};
  getAttribute(_: string) { return this._attrs[_]; }
  setAttribute(_: string, __: string) { this._attrs[_] = __; }
  get attributes() { return Object.keys(this._attrs); }
  supportsAttributes: boolean = true;
}

//
// TODO: write tests for error handling.
//
describe('Context', () => {
  describe('.inherit()', () => {
    it('should inherit the given map.', () => {
      new Context().inherit({ x : 2 }).scope.x.should.equal(2);
    });

    it('should extend the previously inherited context.', () => {
      let c = new Context();
      c.inherit({x: 2, y: 3});
      c.inherit({y: 4, z: 5});

      c.scope.x.should.equal(2);
      c.scope.y.should.equal(4);
      c.scope.z.should.equal(5);
    });

    it('should also inherit another context.', () => {
      new Context()
        .inherit({x : 3})
        .inherit(new Context().inherit({x : 2}))
        .scope.x.should.equal(2);
    });
  });

  describe('.apply()', () => {
    it('should set the text of given node according to `context:text` attribute.', () => {
      let n = new DummyNode('n');
      n.attr('context:text', 'x');
      new Context().inherit({x : 'hellow'}).apply(n);
      n.textContent.should.equal('hellow');
    });

    it('should be able to set nested values of the scope into the text content of given node as well.', () => {
      let n = new DummyNode('n');
      n.attr('context:text', 'x.y');
      new Context().inherit({x : { y: 'hellow'}}).apply(n);
      n.textContent.should.equal('hellow');
    });

    it('should set the proper attribute of given node according to `context:<attr>` attribute.', () => {
      let n = new DummyNode('n');
      n.attr('context:whatever', 'x');
      new Context().inherit({x : 'hellow'}).apply(n);
      n.attrs.whatever.should.equal('hellow');
    });

    it('should be able to set nested values of the scope into the proper attribute content of given node as well.', () => {
      let n = new DummyNode('n');
      n.attr('context:something', 'x.y');
      new Context().inherit({x : { y: 'hellow'}}).apply(n);
      n.attrs.something.should.equal('hellow');
    });

    it('should feed the proper inputs to the component of the node, if it exists.', done => {
      class _C extends AbstractComponent<_N> {
        constructor(N: _N) {
          super({inputs: ['i']}, undefined, N);
        }

        adopt(_: any) {}

        wire() {
          this.ins.get('i').onSent.subscribe(value => {
            value.should.equal(2);
            done();
          });
        }

        clone() { return this; }
      }

      let n = new _N();
      n.component = new _C(n);
      n.attr('context:component:i', 'x');

      new Context().inherit({x : 2}).apply(n);
    });

    it('should also be able to feed proper nested values to the component.', done => {
      class _C extends AbstractComponent<_N> {
        constructor(N: _N) {
          super({inputs: ['j']}, undefined, N);
        }

        adopt(_: any) {}

        wire() {
          this.ins.get('j').onSent.subscribe(value => {
            value.should.equal(false);
            done();
          });
        }

        clone() { return this; }
      }

      let n = new _N();
      n.component = new _C(n);
      n.attr('context:component:j', 'x.y');

      new Context().inherit({x : { y : false }}).apply(n);
    });

    it('should also automatically pass the context to the `.context()` function of the component.', done => {
      let c = new Context();

      class _C extends AbstractComponent<_N> {
        constructor(N: _N) {
          super({}, undefined, N);
        }

        clone() { return this; }
        adopt(_: any) {}

        context(_: Context) {
          _.should.equal(c);
          done();
          return this;
        }
      }

      let n = new _N();
      n.component = new _C(n);

      c.apply(n);
    });
  });
});
