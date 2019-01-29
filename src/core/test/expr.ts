import { should, expect } from 'chai'; should();

import { Expr } from '../expr';


describe('Expr', () => {
  describe('.run()', () => {
    it('should invoke the given function.', done => {
      let e = new Expr(['a'], () => done());
      e.inputs.get('a').receive(2);
    });

    it('should properly pass inputs to given function in order.', done => {
      let e = new Expr(['z', 'a'], (z:any, a:any) => {
        z.should.equal('z');
        a.should.equal('a');
        done();
      });
      e.inputs.get('a').receive('a');
      e.inputs.get('z').receive('z');
    });

    it('should pass a callback to emit "error" events to given function.', done => {
      let e = new Expr([], (error:any) => error('ERR!'));
      e.onError.subscribe(() => done());
      e.control.activate();
    });

    it('should pass the context of the expr to given function.', done => {
      let e = new Expr([], (_:any, context:any) => {
        context.a.should.equal(2);
        done();
      }, {a: 2});
      e.control.activate();
    });

    it('should send the result of the given function, if a normal value, to expr\'s `.result`', done => {
      let e = new Expr([], () => 'hellow');
      e.result.onSent.subscribe(val => {
        val.should.equal('hellow');
        done();
      });
      e.control.activate();
    });

    it('should, if the result of the given function is a function with no args, send the value of that function to expr\'s `.result`', done => {
      let e = new Expr([], () => () => 'hellow');
      e.result.onSent.subscribe(val => {
        val.should.equal('hellow');
        done();
      });
      e.control.activate();
    });

    it('should, if the result of the given function is a function with one arg, call that function with a callback that would send the passed value to expr\'s `.result`', done => {
      let e = new Expr([], () => (done:any) => done('hellow'));
      e.result.onSent.subscribe(val => {
        val.should.equal('hellow');
        done();
      });
      e.control.activate();
    });

    it('should emit "error" if given function causes an error.', done => {
      let e = new Expr([], () => {let x: any; x.a.b; });
      e.onError.subscribe(() => done());
      e.control.activate();
    });
  });
});
