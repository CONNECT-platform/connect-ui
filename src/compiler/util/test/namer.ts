import { should, expect } from 'chai'; should();

import { Namer } from '../namer';


describe('Namer', () => {
  describe('.next', () => {
    it('should give the next name from the given list.', () => {
      let n = new Namer(['hellow', 'world']);
      n.next.should.equal('hellow');
      n.next.should.equal('world');
    });

    it('should start adding numbers and cycle the given list when it exhausts it.', () => {
      let n = new Namer(['hellow', 'world']);
      n.next;
      n.next;
      n.next.should.equal('hellow1');
      n.next.should.equal('world1');
    });

    it('should by default use the alphabet in lower case.', () => {
      let n = new Namer();
      n.next.should.equal('a');
      n.next.should.equal('b');
      n.next.should.equal('c');
    });
  });

  describe('.retrack()', () => {
    it('should cause the next invokation of `.next` to return the last name it returned.', () => {
      let n = new Namer(['hellow', 'world']);
      n.next.should.equal('hellow');
      n.retrack();
      n.next.should.equal('hellow');
      n.next.should.equal('world');
    });

    it('should bring the `.next` result back in the list when called multiple times.', () => {
      let n = new Namer(['a', 'b', 'c']);
      n.next;
      n.next;
      n.retrack();
      n.retrack();
      n.next.should.equal('a');
    });

    it('should have no effect when no name is generated or all names are retracted.', () => {
      let n = new Namer(['hellow', 'world']);
      n.retrack();
      n.next.should.equal('hellow');
      n.retrack();
      n.retrack();
      n.next.should.equal('hellow');
    });
  });

  describe('.reset()', () => {
    it('should reset the namer to star giving names from the beginning.', () => {
      let n = new Namer(['hellow', 'world']);
      n.next; n.next.should.equal('world');
      n.reset();
      n.next.should.equal('hellow');
    });
  });
});
