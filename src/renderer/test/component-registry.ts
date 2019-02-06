import { should, expect } from 'chai'; should();

import registry from '../component-registry';
import { ComponentRegistry } from '../component-registry';

import { RenderingComponent, RendererType } from '../types';


class _NotAComponent implements RenderingComponent<any> {
  mount(_: any){ return this; }
  render(_: RendererType<any>) { return this; }
}

describe('ComponentRegistry', () => {
  describe('.register()', () => {
    it('should register a component factory with a given tag, which is then invoked via `.create()`', done => {
      let r = new ComponentRegistry();
      r.register('comp', () => done() as any);
      r.create('comp');
    });

    it('should override the factory object if it is already registered.', done => {
      let r = new ComponentRegistry();
      r.register('comp', () => undefined);
      r.create('comp');
      r.register('comp', () => done() as any);
      r.create('comp');
    });
  });

  describe('.registered()', () => {
    it('should return true if a factory with given tag is registered, false otherwise.', () => {
      new ComponentRegistry().register('A', () => undefined).registered('A').should.be.true;
      new ComponentRegistry().register('A', () => undefined).registered('B').should.be.false;
    });
  });

  describe('.create()', () => {
    it('should invoke the registered factory and return the result.', () => {
      new ComponentRegistry().register('X', () => new _NotAComponent).create('X').should.be.instanceOf(_NotAComponent);
    });

    it('should return `undefined` if the given tag is not registered.', () => {
      expect(new ComponentRegistry().create('X')).to.be.undefined;
    });
  });
});

describe('registry', () => {
  it('should be a `ComponentRegistry`', () => {
    registry.should.be.instanceOf(ComponentRegistry);
  });
});
