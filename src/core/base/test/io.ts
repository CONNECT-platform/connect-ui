import { should, expect } from 'chai'; should();

import { InputPin, OutputPin, PersistentOutput } from '../io';


describe('InputPin', () => {
  describe('.receive()', () => {
    it('should receive some data accessible on .last', () => {
      let i = new InputPin<string>();
      expect(i.last).to.be.undefined;
      i.receive('hellow');
      i.last.should.equal('hellow');
      i.receive('world');
      i.last.should.equal('world');
    });

    it('should emit "received" event.', done => {
      let i = new InputPin<string>();
      i.on('received').subscribe(value => {
        value.should.be.equal('stuff');
        done();
      });
      i.receive('stuff');
    });

    it('should activate the pin.', () => {
      let i = new InputPin<string>();
      i.activated.should.be.false;
      i.receive('hellow');
      i.activated.should.be.true;
    });
  });

  describe('.compatible()', () => {
    it('should be true for `OutputPin`s', () => {
      new InputPin().compatible(new OutputPin()).should.be.true;
    });

    it('should not be true for other pin types.', () => {
      new InputPin().compatible(new InputPin()).should.be.false;
    });
  });

  describe('.connect()', () => {
    it('should receive data sent to the connected pin.', done => {
      let i = new InputPin<number>();
      let o = new OutputPin<number>();
      i.connect(o);
      i.onReceived.subscribe(value => {
        value.should.equal(2);
        done();
      });
      o.send(2);
    });

    it('should receive multiple values to the connected pin.', () => {
      let i = new InputPin<number>();
      let o = new OutputPin<number>();
      i.connect(o);
      expect(i.last).to.be.undefined;
      o.send(2);
      expect(i.last).to.equal(2);
      o.send(3);
      expect(i.last).to.equal(3);
    });
  });

  describe('.disconnect()', () => {
    it('should no longer receive values sent to disconnected pins.', () => {
      let i = new InputPin<number>();
      let o = new OutputPin<number>();
      i.connect(o);
      o.send(1);
      i.last.should.equal(1);
      o.send(2);
      i.last.should.equal(2);
      i.disconnect(o);
      o.send(3);
      i.last.should.equal(2);
    });
  });

  describe('.reset()', () => {
    it('should also reset the value of .last', () => {
      let i = new InputPin<string>();
      i.receive('hellow');
      i.last.should.equal('hellow');
      i.reset();
      expect(i.last).to.be.undefined;
    });
  });

  describe('.onReceived', () => {
    it('should be equal to `on("received")`', () => {
      let p = new InputPin<string>();
      p.onReceived.should.equal(p.on('received'));
    });
  });
});

describe('OutputPin', () => {
  describe('.send()', () => {
    it('should send some data accessible on .last', () => {
      let i = new OutputPin<string>();
      expect(i.last).to.be.undefined;
      i.send('hellow');
      i.last.should.equal('hellow');
      i.send('world');
      i.last.should.equal('world');
    });

    it('should emit "sent" event.', done => {
      let i = new OutputPin<string>();
      i.on('sent').subscribe(value => {
        value.should.be.equal('stuff');
        done();
      });
      i.send('stuff');
    });

    it('should activate the pin.', () => {
      let i = new OutputPin<string>();
      i.activated.should.be.false;
      i.send('hellow');
      i.activated.should.be.true;
    });
  });

  describe('.compatible()', () => {
    it('should be true for `InputPin`s', () => {
      new OutputPin().compatible(new InputPin()).should.be.true;
    });

    it('should not be true for other pin types.', () => {
      new OutputPin().compatible(new OutputPin()).should.be.false;
    });
  });

  describe('.reset()', () => {
    it('should also reset the value of .last', () => {
      let o = new OutputPin<string>();
      o.send('hellow');
      o.last.should.equal('hellow');
      o.reset();
      expect(o.last).to.be.undefined;
    });
  });

  describe('.onSent()', () => {
    it('should be equal to `on("sent")`', () => {
      let p = new OutputPin();
      p.onSent.should.equal(p.on('sent'));
    });
  });
});

describe('PersistentOutput', () => {
  describe('.connect()', () => {
    it('should instantly send the last sent data to newly connected pins.', () => {
      let o = new OutputPin<string>();
      let i1 = new InputPin<string>();

      o.send('hellow');
      i1.connect(o);
      expect(i1.last).to.be.undefined;

      let po = new PersistentOutput<string>();
      let i2 = new InputPin<string>();

      po.send('hellow');
      i2.connect(po);
      i2.last.should.equal('hellow');
    });

    it('should resend the last sent data to connected pins when they `reset()`', () => {
      let o = new OutputPin<number>();
      let i1 = new InputPin<number>();
      i1.connect(o);
      o.send(2);
      i1.last.should.equal(2);
      i1.reset();
      expect(i1.last).to.be.undefined;

      let po = new PersistentOutput<number>();
      let i2 = new InputPin<number>();
      i2.connect(po);
      po.send(2);
      i2.last.should.equal(2);
      i2.reset();
      i2.last.should.equal(2);
    });

    it('should not send the data to disconnected pins after they reset.', () => {
      let po = new PersistentOutput<string>();
      let i = new InputPin<string>();
      i.connect(po);
      po.send('world');
      i.last.should.equal('world');
      i.reset();
      i.last.should.equal('world');
      i.disconnect(po);
      i.reset();
      expect(i.last).to.be.undefined;
    });
  });
});
