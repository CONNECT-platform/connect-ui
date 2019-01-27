import { should, expect } from 'chai'; should();

import { Observable } from 'rxjs';
import { Topic } from '../topic';


describe('Topic', () => {
  describe('._def()', () => {
    it('should enable subclasses to add subjects.', () => {
      class Sub extends Topic {
        constructor() {
          super();
          this._def<string>('a');
          this._def<number>('b');
        }
      };
    });
  });

  describe('._emit()', () => {
    it('should allow subclasses to emit values on various subjects.', done => {
      class Sub extends Topic {
        constructor() {
          super();
          this._def<number>('f');
        }

        f() {
          this._emit('f', 5);
        }
      }

      let s = new Sub();
      s.on('f').subscribe(val => {
        val.should.equal(5);
        done();
      });
      s.f();
    });
  });

  describe('.on()', () => {
    it('should allow access to defined subjects.', () => {
      class Sub extends Topic {
        constructor() {
          super();
          this._def<string>('a');
        }
      }

      let s = new Sub();
      expect(s.on('a')).to.not.be.undefined;
      expect(s.on('b')).to.be.undefined;
    });

    it('should return Observables.', () => {
      class Sub extends Topic {
        constructor() {
          super();
          this._def<boolean>('x');
        }
      }

      new Sub().on('x').should.be.instanceof(Observable);
    });

    it('should return consistent objects', () => {
      class Sub extends Topic {
        constructor() {
          super();
          this._def<string>('something');
        }
      }

      let s = new Sub();
      s.on('something').should.equal(s.on('something'));
    });
  });

  describe('.subjects', () => {
    it('should be a list of available subjects on this topic.', () => {
      class Sub extends Topic {
        constructor() {
          super();
          this._def<void>('a');
          this._def<boolean>('b');
        }
      }

      let subs = new Sub().subjects;
      subs.should.include('a');
      subs.should.include('b');
      subs.length.should.equal(2);
    });
  })
});
