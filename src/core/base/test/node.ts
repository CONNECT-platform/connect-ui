import { should, expect } from 'chai'; should();

import { SignalPin } from '../control';
import { Node, NodeInputs, NodeOutputCallback, NodeSignalCallback } from '../node';


describe('Node', () => {
  describe('.run()', () => {
    it('should be invoked when all inputs are given.', done => {
      class N extends Node {
        constructor() { super({inputs: ['a', 'b']})}
        run(inputs: NodeInputs, out: NodeOutputCallback) {
          inputs.a.should.equal(2);
          inputs.b.should.equal('hellow');
          done();
        }
      }

      let n = new N();
      n.inputs.get('a').receive(2);
      n.inputs.get('b').receive('hellow');
    });

    it('should be invoked on activation of control if no inputs are specified.', done => {
      class N extends Node {
        constructor() { super({}) }
        run(_: NodeInputs, __: NodeOutputCallback) { done() }
      }

      let n = new N();
      n.control.activate();
    });

    it('should wait for all signals connected to the control pin.', done => {
      class N extends Node {
        constructor() { super({inputs: ['a']}) }
        run(_: NodeInputs, __: NodeOutputCallback) {done();}
      }

      let n = new N();
      let s1 = new SignalPin().connect(n.control);
      let s2 = new SignalPin().connect(n.control);
      n.inputs.get('a').receive(2);
      s1.activate();
      s2.activate();
    });

    it('should emit a "run" event with a profile containing inputs.', done => {
      class N extends Node {
        constructor() { super({inputs: ['a']}) }
        run(_: NodeInputs, __: NodeOutputCallback) {}
      }

      let n = new N();
      n.on('run').subscribe(profile => {
        profile.inputs.a.should.equal('AA');
        done();
      });
      n.inputs.get('a').receive('AA');
    });

    it('should reset the control pin after invokation.', done => {
      class N extends Node {
        constructor() { super({}) }
        run(_: NodeInputs, __: NodeOutputCallback) {}
      }

      let n = new N();
      n.onRun.subscribe(() => {
        n.control.activated.should.be.false;
        done();
      });
      n.control.activate();
    });

    it('should emit "error" when the function errors.', done => {
      class N extends Node {
        constructor() { super({}) }
        run(_: NodeInputs, __: NodeOutputCallback) {
          let x: any;
          x.a.b;
        }
      }

      let n = new N();
      n.onError.subscribe(() => done());
      n.control.activate();
    });

    describe('@param output: NodeOutputCallback', () => {
      it('should be able to send data through the proper output pin via output callback.', done => {
        class N extends Node {
          constructor() { super({outputs: ['x']}) }
          run(_: NodeInputs, out: NodeOutputCallback) { out('x', 'hellow'); }
        }

        let n = new N();
        n.outputs.get('x').onSent.subscribe(value => {
          value.should.equal('hellow');
          done();
        });
        n.control.activate();
      });

      it('should emit an error when the output callback is called with an unspecified output.', done => {
        class N extends Node {
          constructor() { super({outputs: ['a']})}
          run(_: NodeInputs, out: NodeOutputCallback) { out('b', 2); }
        }

        let n = new N();
        n.onError.subscribe(() => done());
        n.control.activate();
      });

      it('should emit an "output" event with a profile containing activated input and output.', done => {
        class N extends Node {
          constructor() { super({inputs: ['a'], outputs: ['x']}) }
          run(_: NodeInputs, out: NodeOutputCallback) { out('x', 'hellow'); }
        }

        let n = new N();
        n.on('output').subscribe(profile => {
          profile.inputs.a.should.equal(2);
          profile.output.output.should.equal('x');
          profile.output.data.should.equal('hellow');
          done();
        });
        n.inputs.get('a').receive(2);
      });
    });

    describe('@param signal: NodeSignalCallback', () => {
      it('should be able to send signals through the proper signal pin via signal callback.', done => {
        class N extends Node {
          constructor() { super({signals: ['s']})}
          run(_: NodeInputs, __: NodeOutputCallback, signal: NodeSignalCallback) { signal('s'); }
        }

        let n = new N();
        n.signals.get('s').onActivated.subscribe(() => done());
        n.control.activate();
      });


      it('should emit an error when the signal callback is called with an unspecified signal.', done => {
        class N extends Node {
          constructor() { super({signals: ['a']})}
          run(_: NodeInputs, __: NodeOutputCallback, signal: NodeSignalCallback) { signal('b'); }
        }

        let n = new N();
        n.onError.subscribe(() => done());
        n.control.activate();
      });

      it('should emit a "signal" event with a profile containing activated input and signal.', done => {
        class N extends Node {
          constructor() { super({inputs: ['a'], signals: ['s']})}
          run(_: NodeInputs, __: NodeOutputCallback, signal: NodeSignalCallback) { signal('s'); }
        }

        let n = new N();
        n.on('signal').subscribe(profile => {
          profile.inputs.a.should.equal(true);
          profile.signal.should.equal('s');
          done();
        });
        n.inputs.get('a').receive(true);
      });
    });
  });

  describe('.onRun', () => {
    it('should be equal to `.on("run")`', () => {
      class N extends Node {
        constructor() { super({}) }
        run(_: NodeInputs, __: NodeOutputCallback) {}
      }

      let n = new N();
      n.onRun.should.equal(n.on("run"));
    });
  });

  describe('.onOutput', () => {
    it('should be equal to `.on("output")`', () => {
      class N extends Node {
        constructor() { super({}) }
        run(_: NodeInputs, __: NodeOutputCallback) {}
      }

      let n = new N();
      n.onOutput.should.equal(n.on("output"));
    });
  });

  describe('.onSignal', () => {
    it('should be equal to `.on("signal")`', () => {
      class N extends Node {
        constructor() { super({}) }
        run(_: NodeInputs, __: NodeOutputCallback) {}
      }

      let n = new N();
      n.onSignal.should.equal(n.on("signal"));
    });
  });
});
