import { should, expect } from 'chai'; should();

import { Resource, ResourceLoadCallback } from '../resource';
import { PersistentOutput } from '../base/io';


describe('Resource', () => {
  describe('.load()', () => {
    it('should be activated at least once when control is activated.', done => {
      class R extends Resource<any> {
        load(_: ResourceLoadCallback<any>) { done(); }
        update(){}
      }

      let r = new R();
      r.control.activate();
    });

    it('should emit a "load" event.', done => {
      class R extends Resource<any> {
        load(_: ResourceLoadCallback<any>) {}
        update(){}
      }

      let r = new R();
      r.on('load').subscribe(() => done());
      r.control.activate();
    });

    describe('@param callback: ResourceLoadCallback', () => {
      it('should send value to `.out`', done => {
        class R extends Resource<number> {
          load(callback: ResourceLoadCallback<number>) { callback(2); }
          update(){}
        }

        let r = new R();
        r.out.onSent.subscribe(val => {
          val.should.equal(2);
          done();
        });
        r.control.activate();
      });

      it('should emit a "loaded" event with the value.', () => {
        class R extends Resource<number> {
          load(callback: ResourceLoadCallback<number>) { callback(2); }
          update(){}
        }

        let r = new R();
        r.on('loaded').subscribe(val => {
          val.should.equal(2);
          r.control.activate();
        });
      });
    });
  });

  describe('.update()', () => {
    it('should be called when `.in` receives a value.', done => {
      class R extends Resource<void> {
        load(_: ResourceLoadCallback<void>) {}
        update(){done()}
      }

      let r = new R();
      r.in.receive();
    });

    it('should emit an "update" event with given value.', done => {
      class R extends Resource<string> {
        load(_: ResourceLoadCallback<string>) {}
        update(){}
      }

      let r = new R();
      r.on('update').subscribe(val => {
        val.should.equal('hellow');
        done();
      });
      r.in.receive('hellow');
    });

    it('should send the updated value to `.out`', done => {
      class R extends Resource<string> {
        load(_: ResourceLoadCallback<string>) {}
        update(){}
      }

      let r = new R();
      r.out.onSent.subscribe(val => {
        val.should.equal('hellow');
        done();
      });
      r.in.receive('hellow');
    });
  });

  describe('.shouldReload()', () => {
    it('should allow subclasses to control loading more than one time.', done => {
      class R extends Resource<string> {
        load(callback: ResourceLoadCallback<string>) { callback('42'); done(); }
        update(){}
        shouldReload() { return false; }
      }

      let r = new R();
      r.control.activate();
      r.control.activate();
    });
  });

  describe('.out', () => {
    it('should be PersistentOutput', () => {
      class R extends Resource<string> {
        load(_: ResourceLoadCallback<string>) {}
        update(){}
      }

      new R().out.should.be.instanceof(PersistentOutput);
    });
  });

  describe('.onLoad', () => {
    it('should be equal to `.on("load")`', () => {
      class R extends Resource<string> {
        load(_: ResourceLoadCallback<string>) {}
        update(){}
      }

      let r = new R();
      r.onLoad.should.equal(r.on('load'));
    });
  });

  describe('.onUpdate', () => {
    it('should be equal to `.on("update")`', () => {
      class R extends Resource<string> {
        load(_: ResourceLoadCallback<string>) {}
        update(){}
      }

      let r = new R();
      r.onUpdate.should.equal(r.on('update'));
    });
  });

  describe('.onLoaded', () => {
    it('should be equal to `.on("loaded")`', () => {
      class R extends Resource<string> {
        load(_: ResourceLoadCallback<string>) {}
        update(){}
      }

      let r = new R();
      r.onLoaded.should.equal(r.on('loaded'));
    });
  });

  it('should properly handle two-way binding to another resource.', () => {
    class R extends Resource<string> {
      load(_: ResourceLoadCallback<string>){}
      update(){}
    }

    let a = new R();
    let b = new R();

    a.out.connect(b.in);
    b.out.connect(a.in);

    a.in.receive('hellow');
    b.out.last.should.equal('hellow');

    b.in.receive('world');
    a.out.last.should.equal('world');
  });
});
