import { should, expect } from 'chai'; should();

import { Agent } from '../agent';
import { Signature } from '../signature';
import { InputPin, OutputPin } from '../io';
import { SignalPin, ControlPin } from '../control';


describe('Agent', () => {
  it('should have input pins according to given signature.', () => {
    let sig: Signature = { inputs: ['a', 'b'] };
    let agent = new Agent(sig);
    agent.inputs.has('a').should.be.true;
    agent.inputs.has('b').should.be.true;
    agent.inputs.has('c').should.be.false;
  });

  it('should have output pins according to given signature.', () => {
    let sig: Signature = { outputs: ['c'] };
    let agent = new Agent(sig);
    agent.outputs.has('c').should.be.true;
    agent.outputs.has('x').should.be.false;
  });

  it('should have signal pins according to given signature.', () => {
    let sig: Signature = { signals: ['s', 'x', 'w'] };
    let agent = new Agent(sig);
    agent.signals.has('s').should.be.true;
    agent.signals.has('z').should.be.false;
    agent.signals.entries.length.should.equal(3);
  });

  it('should have a control signal.', () => {
    expect(new Agent({}).control).not.to.be.undefined;
  });

  it('should lock its inputs, outputs and signal pinmaps.', () => {
    let agent = new Agent({});
    agent.inputs.locked.should.be.true;
    agent.outputs.locked.should.be.true;
    agent.signals.locked.should.be.true;
  });

  describe('.createInput()', () => {
    it('should allow subclasses to provide their own input pin factory.', () => {
      let p = new InputPin<void>();
      class Sub extends Agent {
        protected createInput(_: string) {return p}
      }

      (new Sub({inputs: ['x']})).inputs.get('x').should.equal(p);
    });
  });

  describe('.createOutput()', () => {
    it('should allow subclasses to provide their own output pin factory.', () => {
      let p = new OutputPin<void>();
      class Sub extends Agent {
        protected createOutput(_: string) {return p}
      }

      (new Sub({outputs: ['x']})).outputs.get('x').should.equal(p);
    });
  });

  describe('.createSignal()', () => {
    it('should allow subclasses to provide their own signal pin factory.', () => {
      let p = new SignalPin();
      class Sub extends Agent {
        protected createSignal(_: string) {return p}
      }

      (new Sub({signals: ['x']})).signals.get('x').should.equal(p);
    });
  });

  describe('.createControl()', () => {
    it('should allow subclasses to provide their own control pin factory.', () => {
      let p = new ControlPin();
      class Sub extends Agent {
        protected createControl() {return p}
      }

      (new Sub({})).control.should.equal(p);
    });
  });

  describe('.reset()', () => {
    it('should reset all pins.', () => {
      let a = new Agent({inputs: ['x'], outputs: ['y'], signals: ['z']});
      a.inputs.get('x').receive('hellow');
      a.outputs.get('y').send('world');
      a.signals.get('z').activate();
      a.control.activate();

      a.inputs.get('x').activated.should.be.true;
      a.inputs.get('x').last.should.equal('hellow');
      a.outputs.get('y').activated.should.be.true;
      a.outputs.get('y').last.should.equal('world');
      a.signals.get('z').activated.should.be.true;
      a.control.activated.should.be.true;

      a.reset();

      a.inputs.get('x').activated.should.be.false;
      expect(a.inputs.get('x').last).to.be.undefined;
      a.outputs.get('y').activated.should.be.false;
      expect(a.outputs.get('y').last).to.be.undefined;
      a.signals.get('z').activated.should.be.false;
      a.control.activated.should.be.false;
    });

    it('should emit an "reset" event.', done => {
      let a = new Agent({});
      a.on('reset').subscribe(() => done());
      a.reset();
    });
  });

  describe('error', () => {
    it('should allow subclasses to emit an "error" event.', done => {
      class Sub extends Agent {
        constructor(sig: Signature) {
          super(sig);
          this.onReset.subscribe(() => this.error('RESET NOT TOLERATED!'));
        }
      }

      let a = new Sub({});
      a.on('error').subscribe(() => done());
      a.reset();
    });

    it('should always emit an `Error` object.', done => {
      class Sub extends Agent {
        constructor(sig: Signature) {
          super(sig);
          this.onReset.subscribe(() => this.error('RESET NOT TOLERATED!'));
        }
      }

      let a = new Sub({});
      a.on('error').subscribe(error => {
        expect(error).to.be.instanceof(Error);
        done();
      });
      a.reset();
    });

    it('should emit error object with given message.', done => {
      class Sub extends Agent {
        constructor(sig: Signature) {
          super(sig);
          this.onReset.subscribe(() => this.error('RESET NOT TOLERATED!'));
        }
      }

      let a = new Sub({});
      a.on('error').subscribe(error => {
        error.message.should.equal('RESET NOT TOLERATED!');
        done();
      });
      a.reset();
    });
  });

  describe('.onReset', () => {
    it('should be equal to `on("reset")`', () => {
      let a = new Agent({});
      a.onReset.should.equal(a.on('reset'));
    });
  });

  describe('.onError', () => {
    it('should be equal to `on("error")`', () => {
      let a = new Agent({});
      a.onError.should.equal(a.on('error'));      
    });
  });
});
