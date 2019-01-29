import { should, expect } from 'chai'; should();

import { State } from '../state';
import { PersistentOutput } from '../base/io';


describe('State', () => {
  it('should be instantiable with and w/o an initial value.', () => {
    expect(new State().value).to.be.undefined;;
    expect(new State(3).value).to.equal(3);
    expect(new State('Hey').in.activated).to.be.true;
  });

  describe('.out', () => {
    it('should be a PersistentOutput', () => {
      new State().out.should.be.instanceof(PersistentOutput);
    });

    it('should send data received by state\'s .in', done => {
      let s = new State();
      s.out.onSent.subscribe(value => {
        value.should.equal(2);
        done();
      });
      s.in.receive(2);
    });

    it('should resend data when the state\'s control is activated.', done => {
      let s = new State();
      s.in.receive(2);
      s.out.onSent.subscribe(value => {
        value.should.equal(2);
        done();
      });

      s.control.activate();
    });
  });

  describe('.value', () => {
    it('should be the last value sent to the state\'s .in', () => {
      let s = new State();
      expect(s.value).to.be.undefined;
      s.in.receive('Hola!');
      s.value.should.equal('Hola!');
    });

    it('should cause the state\'s .out to send values that are set for it.', done => {
      let s = new State();
      s.out.onSent.subscribe(val => {
        val.should.equal('XAZ');
        done();
      });
      s.value = 'XAZ';
    });
  });
});
