import { should, expect } from 'chai'; should();

import { Signature, extend, extension } from '../signature';


describe('extend()', () => {
  it('should extend a signature with inputs, outputs and signals of other signatures.', () => {
    let s:Signature = { inputs: ['a1'], signals: ['c1'] };

    extend(s,
        { inputs: ['a2'], outputs: ['b2'], signals: ['c2'] },
        { inputs: ['a3'], outputs: ['b3'] });

    s.inputs.should.have.members(['a1', 'a2', 'a3']);
    s.outputs.should.have.members(['b2', 'b3']);
    s.signals.should.have.members(['c1', 'c2']);
  });

  it('should also return the extended signature.', () => {
    let s = {};
    extend(s, {}).should.equal(s);
  });
});

describe('extension()', () => {
  it('should return an extended signature with inputs, outputs, and signals of given signatures.', () => {
    let s = extension({ inputs: ['a1'], signals: ['c1'] },
                    { inputs: ['a2'], outputs: ['b2'] },
                    { inputs: ['a3'], signals: ['c3'] });
    s.inputs.should.have.members(['a1', 'a2', 'a3']);
    s.outputs.should.have.members(['b2']);
    s.signals.should.have.members(['c1', 'c3']);
  });

  it('should not mutate the original signature.', () => {
    let s: Signature = { inputs: ['a1'] }
    extension(s, { inputs: ['a2'], outputs: ['b2'] });
    s.inputs.should.have.members(['a1']);
    expect(s.outputs).to.be.undefined;
  });
});
