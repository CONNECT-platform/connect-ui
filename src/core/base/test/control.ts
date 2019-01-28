import { should, expect } from 'chai'; should();

import { SignalPin, ControlPin,
        AllGate, PersistentSignal } from '../control';


describe('SignalPin', () => {
  describe('.compatible()', () => {
    it('should be return true for `ControlPin`s', () => {
      new SignalPin().compatible(new ControlPin()).should.be.true;
    });

    it('should return false for other pins', () => {
      new SignalPin().compatible(new SignalPin()).should.be.false;
    });
  });
});

describe('ControlPin', () => {
  describe('.compatible()', () => {
    it('should be return true for `SignalPin`s', () => {
      new ControlPin().compatible(new SignalPin()).should.be.true;
    });

    it('should return false for other pins', () => {
      new ControlPin().compatible(new ControlPin()).should.be.false;
    });
  });

  describe('.connect()', () => {
    it('should activate on activation of connected pin.', done => {
      let cr = new SignalPin();
      let c = new ControlPin();
      cr.connect(c);
      c.onActivated.subscribe(() => done());
      cr.activate();
    });

    it('should activate on activation of any of the connected pins.', done => {
      let cr1 = new SignalPin();
      let cr2 = new SignalPin();
      let c = new ControlPin();
      cr1.connect(c);
      cr2.connect(c)
      c.onActivated.subscribe(() => done());
      cr2.activate();
    });
  });

  describe('.disconnect()', () => {
    it('should no longer active on activation of a disconnect pin.', () => {
      let cr = new SignalPin();
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
      let cr1 = new SignalPin().connect(ag);
      let cr2 = new SignalPin().connect(ag);

      ag.activated.should.be.false;
      cr1.activate();
      ag.activated.should.be.false;
      cr2.activate();
      ag.activated.should.be.true;
    });
  });
});

describe('PersistentSignal', () => {
  describe('.connect()', () => {
    it('should instantly activate newly connected pins if already activated.', () => {
      let cr = new SignalPin().activate();
      let pg = new PersistentSignal().activate();
      let c = new ControlPin();
      c.connect(cr).activated.should.be.false;
      c.connect(pg).activated.should.be.true;
    });

    it('should reactivate connected pins when they `reset()`.', () => {
      let s = new SignalPin();
      let c1 = new ControlPin().connect(s);
      s.activate();
      c1.activated.should.be.true;
      c1.reset();
      c1.activated.should.be.false;

      let pg = new PersistentSignal();
      let c2 = new ControlPin().connect(pg);
      pg.activate();
      c2.activated.should.be.true;
      c2.reset();
      c2.activated.should.be.true;
    });

    it('should no longer reactivate pins that get disconnected.', () => {
      let pg = new PersistentSignal();
      let c = new ControlPin().connect(pg);
      pg.activate();
      c.activated.should.be.true;
      pg.disconnect(c);
      c.reset();
      c.activated.should.be.false;
    });
  });
});
