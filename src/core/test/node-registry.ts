import { should, expect } from 'chai'; should();

import registry from '../node-registry';
import { NodeRegistry, register } from '../node-registry';
import { Node, NodeInputs, NodeOutputCallback } from '../base/node';


describe('NodeRegistry', () => {
  describe('.register()', () => {
    it('should register a signature and a factory on a path, retreivable via `.entries`', () => {
      class N extends Node { constructor(){ super({}); } run(_: NodeInputs, __: NodeOutputCallback) {} }
      let r = new NodeRegistry();
      r.register('X', {}, () => new N());
      expect(r.entries.find(entry => entry.path == 'X')).not.to.be.undefined;
      expect(r.entries.find(entry => entry.path == 'X').entry.factory()).to.be.instanceof(N);
    });

    it('should emit a "registered" event.', done => {
      class N extends Node { constructor(){ super({}); } run(_: NodeInputs, __: NodeOutputCallback) {} }
      let factory = () => new N();
      let signature = {};

      let r = new NodeRegistry();
      r.on('registered').subscribe(e => {
        e.path.should.equal('X');
        e.entry.factory.should.equal(factory);
        e.entry.signature.should.equal(signature);
        done();
      });
      r.register('X', signature, factory);
    });
  });

  describe('.alias()', () => {
    it('should alias a path to another path, retrievable via `.aliases`', () => {
      let r = new NodeRegistry();
      r.alias('X', 'Y');
      expect(r.aliases.find(entry => entry.path == 'X')).not.to.be.undefined;
      expect(r.aliases.find(entry => entry.path == 'X').original).to.equal('Y');
    });

    it('should emit an "aliased" event.', done => {
      let r = new NodeRegistry();
      r.on('aliased').subscribe(event => {
        event.path.should.equal('X');
        event.original.should.equal('Y');
        done();
      });
      r.alias('X', 'Y');
    });
  });

  describe('.resolve()', () => {
    it('should resolve an entry on a registered path.', () => {
      class N extends Node { constructor(){ super({}); } run(_: NodeInputs, __: NodeOutputCallback) {} }
      let r = new NodeRegistry();
      r.register('X', {}, () => new N());
      expect(r.resolve('X')).not.to.be.undefined;
      expect(r.resolve('X').factory()).to.be.instanceof(N);
    });

    it('should resolve through aliases.', () => {
      class N extends Node { constructor(){ super({}); } run(_: NodeInputs, __: NodeOutputCallback) {} }
      let r = new NodeRegistry();
      r.register('X', {}, () => new N());
      r.alias('Y', 'X');
      expect(r.resolve('Y')).not.to.be.undefined;
      expect(r.resolve('Y').factory()).to.be.instanceof(N);
    });

    it('should prioritize aliases over registered names.', () => {
      class N1 extends Node { constructor(){ super({}); } run(_: NodeInputs, __: NodeOutputCallback) {} }
      class N2 extends Node { constructor(){ super({}); } run(_: NodeInputs, __: NodeOutputCallback) {} }
      let r = new NodeRegistry()
                  .alias('N1', 'N2')
                  .register('N1', {}, () => new N1())
                  .register('N2', {}, () => new N2());
      expect(r.resolve('N1').factory()).to.be.instanceof(N2);
    });

    it('should throw an error when some name is not registered.', () => {
      let r = new NodeRegistry().alias('B', 'A');
      expect(() => r.resolve('B')).to.throw;
    });
  });

  describe('.signature()', () => {
    it('should return the registered signature on a path.', () => {
      let signature = {};
      let r = new NodeRegistry().register('S', signature, () => undefined as Node);
      r.signature('S').should.equal(signature);
    });

    it('should resolve aliases as well.', () => {
      let signature = {};
      let r = new NodeRegistry()
                .alias('X', 'S')
                .register('S', signature, () => undefined as Node);
      r.signature('X').should.equal(signature);
    });

    it('should throw an error when path is not registered.', () => {
      expect(() => new NodeRegistry().signature('hellow')).to.throw;
    });
  });

  describe('.instantiate()', () => {
    it('should create an instance of the node registered on given path.', () => {
      class N extends Node { constructor(){ super({}); } run(_: NodeInputs, __: NodeOutputCallback) {} }
      let r = new NodeRegistry().register('N', {}, () => new N());
      r.instantiate('N').should.be.instanceof(N);
    });

    it('should handle aliases.', () => {
      class N extends Node { constructor(){ super({}); } run(_: NodeInputs, __: NodeOutputCallback) {} }
      let r = new NodeRegistry().register('N', {}, () => new N()).alias('M', 'N');
      r.instantiate('M').should.be.instanceof(N);
    });

    it('should throw an error when the path is not registered.', () => {
      expect(() => new NodeRegistry().instantiate('helloww')).to.throw;
    });

    it('should emit an "instantiated" event.', done => {
      class N extends Node { constructor(){ super({}); } run(_: NodeInputs, __: NodeOutputCallback) {} }
      let r = new NodeRegistry().register('N', {}, () => new N()).alias('M', 'N');
      r.on('instantiated').subscribe(event => {
        event.path.should.equal('M');
        event.node.should.be.instanceof(N);
        done();
      });
      r.instantiate('M');
    });
  });

  describe('.onRegistered', () => {
    it('should be equal to `.on("registered")`', () => {
      let r = new NodeRegistry();
      r.onRegistered.should.equal(r.on('registered'));
    });
  });

  describe('.onAliased', () => {
    it('should be equal to `.on("aliased")`', () => {
      let r = new NodeRegistry();
      r.onAliased.should.equal(r.on('aliased'));
    });
  });

  describe('.onInstantiated', () => {
    it('should be equal to `.on("instantiated")`', () => {
      let r = new NodeRegistry();
      r.onInstantiated.should.equal(r.on('instantiated'));
    });
  });
});

describe('node-registry', () => {
  it('should be instanceof `NodeRegistry`', () => {
    registry.should.be.instanceof(NodeRegistry);
  });
});

describe('@register', () => {
  it('should allow creating a node with given signature.', () => {
    @register('/test/n', {
      inputs: ['a', 'b'],
      outputs: ['c', 'd', 'e'],
      signals: ['f', 'g']
    })
    class N extends Node {}

    let n = new N();
    n.inputs.has('a').should.be.true;
    n.outputs.has('d').should.be.true;
    n.signals.has('f').should.be.true;
  });

  it('should register the node class with proper factory in the standard registry.', () => {
    @register('/test/m', {
      inputs: ['a'],
      outputs: ['b']
    }) class M extends Node {}

    registry.instantiate('/test/m').should.be.instanceof(M);
  });

  describe('.on()', () => {
    it('should register the node class on given registry.', () => {
      let r = new NodeRegistry();
      @register('/test/o', {
        inputs: ['a'],
        outputs: ['b']
      }).on(r) class O extends Node {}

      r.instantiate('/test/o').should.be.instanceof(O);
    });
  });
});
