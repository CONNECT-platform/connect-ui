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
});
