import { should, expect } from 'chai'; should();

import { Stateful } from '../stateful';
import { State } from '../state';
import { PersistentOutput } from '../base/io';


describe('Stateful', () => {
  it('should create inputs and outputs for its states.', () => {
    let s = new Stateful({ states: ['a', 'b'] });
    s.inputs.has('a').should.be.true;
    s.outputs.has('b').should.be.true;
  });

  it('should create `PersistentOutput`s for its properties.', () => {
    let s = new Stateful({ properties: ['x'] });
    expect(s.outputs.get('x')).to.be.instanceof(PersistentOutput);
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

  describe('.property', () => {
    it('should return the output pin corresponding to a property.', () => {
      let s = new Stateful({properties: ['a']});
      s.property('a').should.equal(s.outputs.get('a'));
    });

    it('should return `undefined` for unspecified properties.', () => {
      let s = new Stateful({properties: ['a'], outputs: ['b']});
      expect(s.property('b')).to.be.undefined;
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
