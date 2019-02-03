import { should, expect } from 'chai'; should();

import register from '../register';
import signature from '../signature';
import registry from '../../node-registry';
import { NodeRegistry } from '../../node-registry';
import { Node } from '../../base/node';


describe('@register()', () => {
  it('should register a node with given signature on given path.', () => {
    @register('/test/N', { inputs: ['a'] })
    class N extends Node {}
    registry.instantiate('/test/N').should.be.instanceof(N);
  });

  it('should add the given signature to the class.', () => {
    @register('/test/N', { inputs: ['a'] })
    class N extends Node {}
    registry.instantiate('/test/N').inputs.has('a').should.be.true;
  });

  it('should extend signature previously set by `@signature`', () => {
    @register('/test/N', { inputs : ['a'] })
    @signature({ inputs: ['b'] })
    class N extends Node {}

    let n = registry.instantiate('/test/N');
    n.inputs.has('a').should.be.true;
    n.inputs.has('b').should.be.true;
  });

  it('should use the signature set by `@signature` if none provided.', () => {
    @register('/test/N')
    @signature({ inputs: ['i'], signals: ['s'] })
    class N extends Node {}

    let n = registry.instantiate('/test/N');
    n.inputs.has('i').should.be.true;
    n.signals.has('s').should.be.true;
  });

  it('should throw an error if no previous signature set on the class and non is provided.', () => {
    expect(() => {
      @register('/test/N')
      class N extends Node {}
    }).to.throw;
  });

  describe('.on()', () => {
    it('should register on given node registry.', () => {
      let r = new NodeRegistry();

      @register('/test/N').on(r)
      @signature({inputs: ['name']})
      class N extends Node {}

      r.instantiate('/test/N').should.be.instanceOf(N);
    });
  });
});
