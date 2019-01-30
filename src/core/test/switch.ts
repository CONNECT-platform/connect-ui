import { should, expect } from 'chai'; should();

import { Switch } from '../switch';


describe('Switch', () => {
  it('should accept only cases of type string | number | boolean | undefined | null', () => {
    expect(() => new Switch([{}])).to.throw;
  });

  describe('.run()', () => {
    it('should activate the signal corresponding to given value on `.target` input.', done => {
      let s = new Switch([true, false]);
      s.case(false).onActivated.subscribe(() => done());
      s.target.receive(2 != 2);
    });

    it('should send a "..." signal, if specified in its input, when no matching value is found.', done => {
      let s = new Switch(['a', '...']);
      s.default.onActivated.subscribe(() => done());
      s.target.receive('b');
    });

    it('should only send out one signal.', done => {
      let s = new Switch(['a', 'b']);
      s.case('a').onActivated.subscribe(() => done());
      s.case('b').onActivated.subscribe(() => done());
      s.target.receive('a');
    });

    it('should emit "error" when no case is matching and no default is provided.', done => {
      let s = new Switch([]);
      s.onError.subscribe(() => done());
      s.target.receive('a');
    });
  });

  describe('.case()', () => {
    it('should return the signal pin of a given case value.', () => {
      let s = new Switch([2, 3]);
      expect(s.case(2)).to.not.be.undefined;
    });

    it('should return `undefined` for unspecified values.', () => {
      let s = new Switch([2, 3]);
      expect(s.case(4)).to.be.undefined;
    });

    it('should be different for different cases.', () => {
      let s = new Switch([1, 2]);
      s.case(1).should.not.be.equal(s.case(2));
    });

    it('should be different for different cases with same string representation.', () => {
      let s = new Switch([1, '1']);
      s.case(1).should.not.be.equal(s.case('1'));
    });

    it('should be different for `undefined` and `null`.', () => {
      let s = new Switch([undefined, null]);
      s.case(undefined).should.not.be.equal(s.case(null));
    });
  });
});
