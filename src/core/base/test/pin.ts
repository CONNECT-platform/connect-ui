import { should, expect } from 'chai'; should();

import { Pin } from '../pin';


describe('Pin', () => {
  describe('.activate()', () => {
    it('should set the state of the pin to activated.', () => {
      class P extends Pin { compatible() { return false } }
      let p = new P();

      p.activated.should.be.false;
      p.activate();
      p.activated.should.be.true;
    });

    it('should emit an "activated" event.', done => {
      class P extends Pin { compatible() { return false } }
      let p = new P();

      p.on('activated').subscribe(() => done());
      p.activate();
    });
  });

  describe('.reset()', () => {
    it('should reset the state of a pin.', () => {
      class P extends Pin { compatible() { return false } }
      let p = new P();

      p.activate();
      p.activated.should.be.true;
      p.reset();
      p.activated.should.be.false;
    });

    it('should emit the "reset" event.', done => {
      class P extends Pin { compatible() { return false } }
      let p = new P();

      p.on('reset').subscribe(() => done());
      p.activate().reset();
    });
  });

  describe('.connect()', () => {
    it('should connect when .compatible() returns true', () => {
      class P extends Pin { compatible() { return true; } }
      let a = new P(); let b = new P();
      a.connect(b);
      a.connections.should.include(b);
    });

    it('should throw an error when .compatible() returns false', () => {
      class P extends Pin { compatible() { return false; } }
      let a = new P(); let b = new P();
      expect(() => a.connect(b)).to.throw;
    });

    it('should connect symmetrically.', () => {
      class P extends Pin { compatible() { return true; } }
      let a = new P(); let b = new P();
      a.connect(b);
      b.connections.should.include(a);
    });

    it('should emit "connected" event.', done => {
      class P extends Pin { compatible() { return true; } }
      let a = new P(); let b = new P();

      a.on('connected').subscribe(pin => {
        pin.should.equal(b);
        done();
      });
      a.connect(b);
    });
  });

  describe('.disconnect()', () => {
    it('should disconnect a connected pin.', () => {
      class P extends Pin { compatible() { return true; } }
      let a = new P(); let b = new P();

      a.connect(b); a.connections.should.include(b);
      a.disconnect(b); a.connections.should.not.include(b);
    });

    it('should disconnect symmetrically.', () => {
      class P extends Pin { compatible() { return true; } }
      let a = new P(); let b = new P();

      a.connect(b); a.connections.should.include(b);
      b.disconnect(a); a.connections.should.not.include(b);
    });

    it('should emit "disconnected" event.', done => {
      class P extends Pin { compatible() { return true; } }
      let a = new P(); let b = new P();

      a.on('disconnected').subscribe(pin => {
        pin.should.equal(b);
        done();
      });
      a.connect(b).disconnect(b);
    });
  });

  describe('.connected()', () => {
    it('should return true when two pins are connected.', () => {
      class P extends Pin { compatible() { return true; } }
      let a = new P(); let b = new P();

      a.connected(b).should.be.false;
      a.connect(b).connected(b).should.be.true;
    });
  });

  describe('.activated', () => {
    it('should return true if the pin is activated.', () => {
      class P extends Pin { compatible() { return true; } }
      let p = new P();
      p.activated.should.be.false;
      p.activate();
      p.activated.should.be.true;
    });
  });

  describe('.onConnected', () => {
    it('should be equal to `on("connected")`', () => {
      class P extends Pin { compatible() { return true; } }
      let p = new P();
      p.onConnected.should.equal(p.on('connected'));
    });
  });

  describe('.onDisconnected', () => {
    it('should be equal to `on("disconnected")`', () => {
      class P extends Pin { compatible() { return true; } }
      let p = new P();
      p.onDisconnected.should.equal(p.on('disconnected'));
    });
  });

  describe('.onActivated', () => {
    it('should be equal to `on("activated")`', () => {
      class P extends Pin { compatible() { return true; } }
      let p = new P();
      p.onActivated.should.equal(p.on('activated'));
    });
  });

  describe('.onReset', () => {
    it('should be equal to `on("reset")`', () => {
      class P extends Pin { compatible() { return true; } }
      let p = new P();
      p.onReset.should.equal(p.on('reset'));
    });
  });
});
