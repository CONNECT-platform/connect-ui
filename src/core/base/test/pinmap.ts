import { should, expect } from 'chai'; should();

import { PinMap } from '../pinmap';
import { InputPin, OutputPin } from '../io';


describe('PinMap', () => {
  describe('.attach()', () => {
    it('should attach a given pin with a given tag to the map, retreivable by .get()', () => {
      let pm = new PinMap<InputPin<number>>();
      let p = new InputPin<number>();
      expect(pm.get('x')).to.be.undefined;
      pm.attach('x', p);
      pm.get('x').should.equal(p);
    });

    it('should emit an "attached" event.', done => {
      let pm = new PinMap<InputPin<void>>();
      let p = new InputPin<void>();
      pm.on('attached').subscribe(entry => {
        entry.tag.should.equal('x');
        entry.pin.should.equal(p);
        done();
      });
      pm.attach('x', p);
    });

    it('should first detach an already attached pin by emitting a "detached" event.', done => {
      let pm = new PinMap<OutputPin<string>>();
      let p1 = new OutputPin<string>();
      let p2 = new OutputPin<string>();

      pm.on('detached').delay(0).subscribe(entry => {
        entry.tag.should.equal('P');
        entry.pin.should.equal(p1);
        done();
      });

      pm.attach('P', p1);
      pm.attach('P', p2);
      pm.get('P').should.equal(p2);
    });
  });

  describe('.detach()', () => {
    it('should detach the pin from given tag.', () => {
      let pm = new PinMap<OutputPin<void>>();
      let p = new OutputPin<void>();
      pm.attach('Z', p);
      pm.get('Z').should.equal(p);
      pm.detach('Z');
      expect(pm.get('Z')).to.be.undefined;
    });

    it('should emit a "detached" event.', done => {
      let pm = new PinMap<OutputPin<void>>();
      let p = new OutputPin<void>();

      pm.on('detached').subscribe(entry => {
        entry.tag.should.equal('Y');
        entry.pin.should.equal(p);
        done();
      });

      pm.attach('Y', p);
      pm.detach('Y');
    });
  });

  describe('.cleanup()', () => {
    it('should cleanup all of its pins.', () => {
      let pm = new PinMap<InputPin<void>>();
      let a = new InputPin<void>();
      let b = new OutputPin<void>();
      pm.attach('X', a);
      a.connect(b);
      a.onReceived.subscribe(() => { throw new Error('this should not have happened.'); });
      pm.cleanup();
      b.send();
    });
  });

  describe('.has()', () => {
    it('should return true for tags that exist on a map.', () => {
      let pm = new PinMap<InputPin<void>>();
      pm.attach('a', new InputPin<void>());
      pm.has('a').should.be.true;
    });

    it('should return false for tags that dont exist on a map.', () => {
      let pm = new PinMap<InputPin<void>>();
      pm.attach('a', new InputPin<void>());
      pm.has('b').should.be.false;
    });

    it('should return false for detached tags.', () => {
      let pm = new PinMap<InputPin<void>>();
      pm.attach('a', new InputPin<void>());
      pm.has('a').should.be.true;
      pm.detach('a');
      pm.has('a').should.be.false;
    });

    it('should return true for re-attached tags.', () => {
      let pm = new PinMap<InputPin<void>>();
      pm.attach('a', new InputPin<void>());
      pm.has('a').should.be.true;
      pm.detach('a');
      pm.has('a').should.be.false;
      pm.attach('a', new InputPin<void>());
      pm.has('a').should.be.true;
    });
  });

  describe('.entries', () => {
    it('should include all attached tags with their corresponding pins.', () => {
      let pm = new PinMap<InputPin<boolean>>();
      let p1 = new InputPin<boolean>();
      let p2 = new InputPin<boolean>();
      pm.attach('a', p1).attach('b', p2);

      expect(pm.entries.find(entry => entry.tag == 'a')).not.to.be.undefined;
      expect(pm.entries.find(entry => entry.tag == 'b')).not.to.be.undefined;

      pm.entries.find(entry => entry.tag == 'a').pin.should.equal(p1);
      pm.entries.find(entry => entry.tag == 'b').pin.should.equal(p2);
    });

    it('should only include attached tags and their corresponding pins.', () => {
      let pm = new PinMap<InputPin<number>>();
      let p1 = new InputPin<number>();
      let p2 = new InputPin<number>();
      pm.attach('a', p1).attach('b', p2);

      pm.entries.length.should.equal(2);
    });

    it('should give back the attached tags and their corresponding pins in the attached order.', () => {
      let pm = new PinMap<InputPin<any>>();
      let p1 = new InputPin<string>();
      let p2 = new InputPin<boolean>();
      pm.attach('a', p1).attach('b', p2);

      pm.entries[0].pin.should.equal(p1);
      pm.entries[1].tag.should.equal('b');
    });
  });

  describe('.lock()', () => {
    it('should lock the pinmap from further modificaiton.', () => {
      let pm = new PinMap<OutputPin<any>>();
      pm
        .attach('x', new OutputPin<string>())
        .lock()
        .attach('y', new OutputPin<void>());

        expect(pm.get('x')).not.to.be.undefined;
        expect(pm.get('y')).to.be.undefined;
    });

    it('should emit a "locked" event.', done => {
      let pm = new PinMap<InputPin<[]>>();
      pm.on('locked').subscribe(() => done());
      pm.lock();
    });
  });

  describe('.locked', () => {
    it('should return true when the pinmap is locked.', () => {
      let pm = new PinMap<InputPin<{}>>();
      pm.locked.should.be.false;
      pm.lock();
      pm.locked.should.be.true;
    });
  });

  describe('.onLocked', () => {
    it('should be equal to `on("locked")`', () => {
      let pm = new PinMap();
      pm.onLocked.should.equal(pm.on('locked'));
    });
  });

  describe('.onAttached', () => {
    it('should be equal to `on("attached")`', () => {
      let pm = new PinMap();
      pm.onAttached.should.equal(pm.on('attached'));
    });
  });

  describe('.onDetached', () => {
    it('should be equal to `on("detached")`', () => {
      let pm = new PinMap();
      pm.onDetached.should.equal(pm.on('detached'));
    });
  });
});
