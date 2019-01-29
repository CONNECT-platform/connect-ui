import { should, expect } from 'chai'; should();

import { Relay } from '../relay';


describe('Relay', () => {
  describe('.out', () => {
    it('should activate on any input.', done => {
      let r = new Relay();
      r.out.onActivated.subscribe(() => done());
      r.in.receive(2);
    });

    it('should activate on control activation.', done => {
      let r = new Relay();
      r.out.onActivated.subscribe(() => done());
      r.control.activate();      
    });
  });
});
