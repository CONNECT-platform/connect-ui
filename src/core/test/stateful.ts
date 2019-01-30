import { should, expect } from 'chai'; should();

import { Stateful } from '../stateful';
import { State } from '../state';


describe('Stateful', () => {
  it('should create inputs and outputs for its states.', () => {
    let s = new Stateful({ states: ['a', 'b'] });
    s.inputs.has('a').should.be.true;
    s.outputs.has('b').should.be.true;
  });

  describe('.state()', () => {
    it('should receive an input when the input with the same name on the agent receives data.', () => {
      let s = new Stateful({states: ['a']});
      s.inputs.get('a').receive(2);
      s.state('a').value.should.equal(2);
    });

    it('should send the output to the agent\'s output of the same name when it sends an output.', () => {
      let s = new Stateful({states: ['a']});
      s.state('a').out.send(2);
      s.outputs.get('a').last.should.equal(2);
    });
  });

  describe('.createState()', () => {
    it('should allow subclasses to provide a state factory.', () => {
      class S extends State<number> {}
      class SF extends Stateful {
        protected createState(): S { return new S(); }
      }

      let sf = new SF({states: ['a']});
      sf.state('a').should.be.instanceof(S);
    });
  });
});
