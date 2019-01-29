import { should, expect } from 'chai'; should();

import { Value } from '../value';
import { PersistentOutput } from '../base/io';


describe('Value', () => {
  describe('.out', () => {
    it('should bear the value that it was initiated with.', () => {
      new Value(3).out.last.should.equal(3);
    });

    it('should be a PersistentOutput', () => {
      new Value({}).out.should.be.instanceof(PersistentOutput);
    });

    it('should resend the value when the value\'s control is activated.', done => {
      let v = new Value('hellow');
      v.out.onSent.subscribe(val => {
        val.should.equal('hellow');
        done();
      });

      v.control.activate();
    });
  });

  describe('.value', () => {
    it('should give back the initiated value.', () => {
      new Value('Well ...').value.should.equal('Well ...');
    });
  });
});
