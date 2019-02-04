import { should, expect } from 'chai'; should();

import { Call } from '../call';
import { NodeRegistry } from '../node-registry';

import { Node, NodeInputs, NodeOutputCallback, NodeSignalCallback } from '../base/node';
import register from '../decorators/register';
import signature from '../decorators/signature';


describe('Call', () => {
  it('should have a signature equal to the node registered on given path.', () => {
    @register('/test/N')
    @signature({ inputs: ['in'], outputs: ['out'], signals: ['sig'] })
    class N extends Node {}

    let c = new Call('/test/N');
    c.inputs.has('in').should.be.true;
    c.outputs.has('out').should.be.true;
    c.signals.has('sig').should.be.true;
  });

  it('should be able to pull a registered class from a custom registry.', () => {
    let r = new NodeRegistry();

    @register('/test/N').on(r)
    @signature({ inputs: ['hola'] })
    class N extends Node {}

    let c = new Call('/test/N', r);
    c.inputs.has('hola').should.be.true;
  });

  describe('.run()', () => {
    it('should create a new instance of the registered node.', done => {
      @register('/test/N')
      @signature({ inputs: ['x'] })
      class N extends Node {
        constructor() {
          super();
          done();
        }
      }

      new Call('/test/N').inputs.get('x').receive(2);
    });

    it('should run the registered node with proper inputs.', done => {
      @register('/test/N')
      @signature({ inputs: ['x', 'y'] })
      class N extends Node {
        protected run(inputs: NodeInputs, output: NodeOutputCallback) {
          inputs.x.should.equal(2);
          inputs.y.should.equal(3);
          done();
        }
      }

      let c = new Call('/test/N');
      c.inputs.get('x').receive(2);
      c.inputs.get('y').receive(3);
    });

    it('should output the registered node\'s output.', done => {
      @register('/test/N')
      @signature({ inputs: ['x', 'y'], outputs: ['o'] })
      class N extends Node {
        protected run(inputs: NodeInputs, output: NodeOutputCallback) {
          output('o', inputs.x + inputs.y);
        }
      }

      let c = new Call('/test/N');
      c.onOutput.subscribe(profile => {
        profile.output.output.should.equal('o');
        profile.output.data.should.equal(5);
        done();
      });

      c.inputs.get('x').receive(2);
      c.inputs.get('y').receive(3);
    });

    it('should signal the registered node\'s signal.', done => {
      @register('/test/N')
      @signature({ inputs: ['x', 'y'], signals: ['s'] })
      class N extends Node {
        protected run(_: NodeInputs, __:any, signal: NodeSignalCallback) {
          signal('s');
        }
      }

      let c = new Call('/test/N');
      c.onSignal.subscribe(profile => {
        profile.signal.should.equal('s');
        done();
      });

      c.inputs.get('x').receive(2);
      c.inputs.get('y').receive(3);
    });

    it('should error the registered node\'s error.', done => {
      @register('/test/N')
      @signature({ inputs: ['x', 'y'] })
      class N extends Node {
        protected run() {
          this.error('well ...');
        }
      }

      let c = new Call('/test/N');
      c.onError.subscribe(error => {
        error.message.should.equal('well ...');
        done();
      });

      c.inputs.get('x').receive(2);
      c.inputs.get('y').receive(3);
    });
  });
});
