import { should, expect } from 'chai'; should();

import { Stack } from '../stack';

describe('Stack', () => {
  describe('.push()', () => {
    it('should push a value to the stack, retrievable via `.peek`', () => {
      let s = new Stack<number>();
      s.push(42);
      s.peek.should.equal(42);
      s.push(56);
      s.peek.should.equal(56);
    });
  });

  describe('.pop()', () => {
    it('should return the last value pushed to the stack.', () => {
      let s = new Stack<string>();
      s.push('hellow');
      s.push('world');
      s.pop().should.equal('world');
    });

    it('should remove the last item of the stack as well.', () => {
      let s = new Stack<string>();
      s.push('hellow');
      s.push('world');
      s.pop();
      s.pop().should.equal('hellow');
    });
  });

  describe('.empty', () => {
    it('should be true only when the stack is emtpy.', () => {
      let s = new Stack<boolean>();
      s.empty.should.be.true;
      s.push(true);
      s.push(false);
      s.empty.should.be.false;
      s.pop();
      s.pop();
      s.empty.should.be.true;
    });
  });
});
