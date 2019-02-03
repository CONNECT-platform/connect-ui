import { should, expect } from 'chai'; should();

import signature from '../signature';
import { Agent } from '../../base/agent';


describe('@signature()', () => {
  it('should impose given signature on the given agent class.', () => {
    @signature({
      inputs: ['a'],
      outputs: ['b'],
      signals: ['c']
    }) class X extends Agent {}

    new X().inputs.has('a').should.be.true;
    new X().outputs.has('b').should.be.true;
    new X().signals.has('c').should.be.true;
  });

  it('should append to the signature of the class.', () => {
    class X extends Agent {
      constructor() {
        super({inputs: ['a1'], outputs: ['b1'], signals: ['c1']});
      }
    }

    @signature({
      inputs: ['a2'],
      outputs: ['b2'],
      signals: ['c2']
    }) class Y extends X {}

    new Y().inputs.has('a1').should.be.true;
    new Y().inputs.has('a2').should.be.true;
    new Y().outputs.has('b1').should.be.true;
    new Y().outputs.has('b2').should.be.true;
    new Y().signals.has('c1').should.be.true;
    new Y().signals.has('c2').should.be.true;
  });

  it('should set the `.signature` property on the class.', () => {
    @signature({
      inputs: ['a']
    })
    class X extends Agent {}

    (X as any).signature.inputs.should.include('a');
  });

  it('should extend the `.signature` property if it was already defined on the class.', () => {
    @signature({signals: ['a']})
    @signature({signals: ['b']})
    class X extends Agent {}

    let x = new X();
    x.signals.has('a').should.be.true;
    x.signals.has('b').should.be.true;

    (X as any).signature.signals.should.include('a');
    (X as any).signature.signals.should.include('b');
  });
});
