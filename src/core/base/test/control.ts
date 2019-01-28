import { should, expect } from 'chai'; should();

import { ControllerPin, ControlPin,
        AllGate, PersistentGate } from '../control';


describe('ControllerPin', () => {
  describe('.compatible()', () => {
    it('should be return true for `ControlPin`s', () => {
      new ControllerPin().compatible(new ControlPin()).should.be.true;
    });

    it('should return false for other pins', () => {
      new ControllerPin().compatible(new ControllerPin()).should.be.false;
    });
  });
});

describe('ControlPin', () => {
  describe('.compatible()', () => {
    it('should be return true for `ControlerlPin`s', () => {
      new ControlPin().compatible(new ControllerPin()).should.be.true;
    });

    it('should return false for other pins', () => {
      new ControlPin().compatible(new ControlPin()).should.be.false;
    });
  });

  describe('.connect()', () => {
    it('should activate on activation of connected pin.', done => {
      let cr = new ControllerPin();
      let c = new ControlPin();
      cr.connect(c);
      c.onActivated.subscribe(() => done());
      cr.activate();
    });

    it('should activate on activation of any of the connected pins.', done => {
      let cr1 = new ControllerPin();
      let cr2 = new ControllerPin();
      let c = new ControlPin();
      cr1.connect(c);
      cr2.connect(c)
      c.onActivated.subscribe(() => done());
      cr2.activate();
    });
  });

  describe('.disconnect()', () => {
    it('should no longer active on activation of a disconnect pin.', () => {
      let cr = new ControllerPin();
      let c = new ControlPin();
      cr.connect(c).activate();
      c.activated.should.be.true;

      c.reset();
      cr.activate();
      c.activated.should.be.true;

      c.reset();
      cr.disconnect(c).activate();
      c.activated.should.be.false;
    });
  });
});

describe('AllGate', () => {
  describe('.activate()', () => {
    it('should only activate when all connected pins are activated.', () => {
      let ag = new AllGate();
      let cr1 = new ControllerPin().connect(ag);
      let cr2 = new ControllerPin().connect(ag);

      ag.activated.should.be.false;
      cr1.activate();
      ag.activated.should.be.false;
      cr2.activate();
      ag.activated.should.be.true;
    });
  });
});

describe('PersistentGate', () => {
  describe('.connect()', () => {
    it('should instantly activate newly connected pins if already activated.', () => {
      let cr = new ControllerPin().activate();
      let pg = new PersistentGate().activate();
      let c = new ControlPin();
      c.connect(cr).activated.should.be.false;
      c.connect(pg).activated.should.be.true;
    });
  });

  describe('.reset()', () => {
    it('should not reset the state of the pin.', () => {
      let pg = new PersistentGate();
      pg.activated.should.be.false;
      pg.activate().activated.should.be.true;
      pg.reset().activated.should.be.true;
    });
  });

  describe('.deactivate()', () => {
    it('should trigger a deactivation instead of `reset()`.', () => {
      let pg = new PersistentGate();
      pg.activated.should.be.false;
      pg.activate().activated.should.be.true;
      pg.deactivate().activated.should.be.false;
    });
  });
});
