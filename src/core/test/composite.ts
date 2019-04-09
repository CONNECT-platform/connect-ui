import { should, expect } from 'chai'; should();

import { Composite } from '../composite';
import { Relay } from '../relay';
import { State } from '../state';
import { Switch } from '../switch';
import { Value } from '../value';
import { Expr } from '../expr';
import { Call } from '../call';

import { NodeRegistry } from '../node-registry';
import { Node } from '../base/node';
import register from '../decorators/register';

import { InputPin, OutputPin } from '../base/io';
import { SignalPin, ControlPin } from '../base/control';


describe('Composite', () => {
  it('should be locked after it is constructed.', () => {
    new Composite({ inputs: ['a', 'b']}).locked.should.be.true;
  });

  describe('.build()', () => {
    it('should allow sub classes to do some binding of the pins and what not.', done => {
      class Sub extends Composite { build() { done(); } }
      new Sub({});
    });

    it('should be executed when the composite is still unlocked.', done => {
      class Sub extends Composite { build() {
        this.locked.should.be.false;
        done();
      } }
      new Sub({});
    });
  });

  describe('.add()', () => {
    it('should allow subclasses to add child agents during build.', () => {
      class Sub extends Composite {
        build() { this.add('A', this); }
      }

      let s = new Sub({});
      expect(s.children['A']).to.equal(s);
    });

    it('should not allow subclasses to add child agents after build (when the composite is locked.)', () => {
      class Sub extends Composite {
        afterBuild() { this.add('A', this); }
      }

      let s = new Sub({});
      s.afterBuild();
      expect(s.children['A']).to.be.undefined;
    });

    it('should return the added agent.', done => {
      class Sub extends Composite {
        build() {
          this.add('A', this).should.equal(this);
          done();
        }
      }

      new Sub({});
    });
  });

  describe('.relay()', () => {
    it('should allow subclasses to add a relay to child agents during build.', () => {
      class Sub extends Composite {
        build() { this.relay('A'); }
      }

      let s = new Sub({});
      expect(s.children.A).to.be.instanceof(Relay);
    });

    it('should only work during build (before the composite is locked).', () => {
      class Sub extends Composite {
        afterBuild() { this.relay('A'); }
      }

      let s = new Sub({});
      s.afterBuild();
      expect(s.children.A).to.be.undefined;
    });

    it('should return the added relay.', done => {
      class Sub extends Composite {
        build() {
          this.relay('A').should.equal(this.children.A);
          done();
        }
      }

      new Sub({});
    });
  });

  describe('.state()', () => {
    it('should allow subclasses to add a state to child agents during build.', () => {
      class Sub extends Composite {
        build() { this.state('A'); }
      }

      let s = new Sub({});
      expect(s.children.A).to.be.instanceof(State);
    });

    it('should allow subclasses to set the initial value of the state.', () => {
      class Sub extends Composite {
        build() { this.state('A', 2); }
      }

      let s = new Sub({});
      (s.children.A as State<any>).value.should.equal(2);
    });

    it('should only work during build (before the composite is locked).', () => {
      class Sub extends Composite {
        afterBuild() { this.state('A'); }
      }

      let s = new Sub({});
      s.afterBuild();
      expect(s.children.A).to.be.undefined;
    });

    it('should return the added state.', done => {
      class Sub extends Composite {
        build() {
          this.state('A').should.equal(this.children.A);
          done();
        }
      }

      new Sub({});
    });
  });

  describe('.switch()', () => {
    it('should allow subclasses to add a switch to child agents during build.', () => {
      class Sub extends Composite {
        build() { this.switch('A', [2, 'hellow']); }
      }

      let s = new Sub({});
      expect(s.children.A).to.be.instanceOf(Switch);
      expect((s.children.A as Switch).case(2)).not.to.be.undefined;
      expect((s.children.A as Switch).case('hellow')).not.to.be.undefined;
      expect((s.children.A as Switch).case('world')).to.be.undefined;
    });

    it('should only work during build (before the composite is locked).', () => {
      class Sub extends Composite {
        afterBuild() { this.switch('A', []); }
      }

      let s = new Sub({});
      s.afterBuild();
      expect(s.children.A).to.be.undefined;
    });

    it('should return the added switch.', done => {
      class Sub extends Composite {
        build() {
          this.switch('A', []).should.equal(this.children.A);
          done();
        }
      }

      new Sub({});
    });
  });

  describe('.value()', () => {
    it('should allow subclasses to add a value to child agents during build.', () => {
      class Sub extends Composite {
        build() { this.value('A', 3); }
      }

      let s = new Sub({});
      expect(s.children.A).to.be.instanceOf(Value);
      (s.children.A as Value<any>).value.should.equal(3);
    });

    it('should only work during build (before the composite is locked).', () => {
      class Sub extends Composite {
        afterBuild() { this.value('A', 3); }
      }

      let s = new Sub({});
      s.afterBuild();
      expect(s.children.A).to.be.undefined;
    });

    it('should return the added value.', done => {
      class Sub extends Composite {
        build() {
          this.value('A', 3.14).should.equal(this.children.A);
          done();
        }
      }

      new Sub({});
    });
  });

  describe('.expr()', () => {
    it('should allow subclasses to add an expr to child agents during build.', () => {
      class Sub extends Composite {
        build() { this.expr('A', ['a', 'b'], () => {}); }
      }

      let s = new Sub({});
      expect(s.children.A).to.be.instanceOf(Expr);
    });

    it('should pass the composite as the `parent` object in the context passed to the expr.', done => {
      class Sub extends Composite {
        build() {
          this.expr('A', [], (_, context) => {
            context.parent.should.equal(s);
            done();
          });
        }
      }

      let s = new Sub({});
      s.children.A.control.activate();
    });

    it('should only work during build (before the composite is locked).', () => {
      class Sub extends Composite {
        afterBuild() { this.expr('A', [], () => {}); }
      }

      let s = new Sub({});
      s.afterBuild();
      expect(s.children.A).to.be.undefined;
    });

    it('should return the added expr.', done => {
      class Sub extends Composite {
        build() {
          this.expr('A', [], () => {}).should.equal(this.children.A);
          done();
        }
      }

      new Sub({});
    });
  });

  describe('.call()', () => {
    it('should allow subclasses to add a call to child agents during build.', () => {
      @register('/test/N', {}) class N extends Node {}

      class Sub extends Composite {
        build() { this.call('A', '/test/N'); }
      }

      let s = new Sub({});
      expect(s.children.A).to.be.instanceOf(Call);
    });

    it('should allow the call to be from a custom registry.', () => {
      let r = new NodeRegistry();
      @register('/test/NN', {}).on(r) class N extends Node {}

      class Sub extends Composite {
        build() { this.call('A', '/test/NN', r); }
      }

      let s = new Sub({});
      expect(s.children.A).to.be.instanceOf(Call);
    });

    it('should fallback to the composite\'s own custom registry (if provided to the constructor).', () => {
      let r = new NodeRegistry();
      @register('/test/NNN', {}).on(r) class N extends Node {}

      class Sub extends Composite {
        constructor() { super({}, r); }
        build() { this.call('A', '/test/NNN'); }
      }

      let s = new Sub();
      expect(s.children.A).to.be.instanceOf(Call);
    });

    it('should only work during build (before the composite is locked).', () => {
      class Sub extends Composite {
        afterBuild() { this.call('A', '/test/N'); }
      }

      let s = new Sub({});
      s.afterBuild();
      expect(s.children.A).to.be.undefined;
    });

    it('should return the added call.', done => {
      @register('/test/N', {}) class N extends Node {}

      class Sub extends Composite {
        build() {
          this.call('A', '/test/N').should.equal(this.children.A);
          done();
        }
      }

      new Sub({});
    });
  });

  describe('.in', () => {
    it('should contain `OutputPin`s for each input in the signature.', done => {
      class Sub extends Composite {
        constructor() { super({inputs: ['a', 'b']})}
        build() {
          this.in.has('a').should.be.true;
          this.in.has('b').should.be.true;
          this.in.get('a').should.be.instanceOf(OutputPin);
          this.in.get('b').should.be.instanceOf(OutputPin);
          done();
        }
      }

      new Sub();
    });

    it('should have `OutputPin`s that activate when the inputs of the composite receive data.', done => {
      class Sub extends Composite {
        constructor() { super({ inputs: ['a'] })}
        build() {
          this.in.get('a').onSent.subscribe(data => {
            data.should.equal(2);
            done();
          });
        }
      }

      let s = new Sub();
      s.inputs.get('a').receive(2);
    });

    it('should be locked by default.', done => {
      class Sub extends Composite {
        build() {
          this.in.locked.should.be.true;
          done();
        }
      }

      new Sub({});
    });
  });

  describe('.out', () => {
    it('should contain `InputPin`s for each output in the signature.', done => {
      class Sub extends Composite {
        constructor() { super({ outputs: ['a', 'b'] })}
        build() {
          this.out.has('a').should.be.true;
          this.out.has('b').should.be.true;
          this.out.get('a').should.be.instanceOf(InputPin);
          this.out.get('b').should.be.instanceOf(InputPin);
          done();
        }
      }

      new Sub();
    });

    it('should have `InputPin`s that cause the outputs of the composite to send their received data.', done => {
      class Sub extends Composite {
        constructor() { super({ outputs: ['a'] }); }
        something() {
          this.out.get('a').receive(2);
        }
      }

      let s = new Sub();
      s.outputs.get('a').onSent.subscribe(data => {
        data.should.equal(2);
        done();
      });

      s.something();
    });

    it('should be locked by default.', done => {
      class Sub extends Composite {
        build() {
          this.out.locked.should.be.true;
          done();
        }
      }

      new Sub({});
    });
  });

  describe('.sig', () => {
    it('should contain a `ControlPin` for every signal in the signature.', done => {
      class Sub extends Composite {
        constructor() { super({ signals: ['a', 'b'] })}
        build() {
          this.sig.has('a').should.be.true;
          this.sig.has('b').should.be.true;
          this.sig.get('a').should.be.instanceOf(ControlPin);
          this.sig.get('b').should.be.instanceOf(ControlPin);
          done();
        }
      }

      new Sub();
    });

    it('should contain `ControlPin`s that when activated will cause the corresponding signals in the composite to be activated.', done => {
      class Sub extends Composite {
        constructor() { super({ signals: ['s'] })}
        something() {
          this.sig.get('s').activate();
        }
      }

      let s = new Sub();
      s.signals.get('s').onActivated.subscribe(() => done());
      s.something();
    });

    it('should be locked by default', done => {
      class Sub extends Composite {
        build() {
          this.sig.locked.should.be.true;
          done();
        }
      }

      new Sub({});
    });
  });

  describe('.ctrl', () => {
    it('should be a `SignalPin`.', done => {
      class Sub extends Composite {
        build() {
          this.ctrl.should.be.instanceOf(SignalPin);
          done();
        }
      }

      new Sub({});
    });

    it('should be activated when the control of the composite is activated.', done => {
      class Sub extends Composite {
        build() {
          this.ctrl.onActivated.subscribe(() => done());
        }
      }

      new Sub({}).control.activate();
    });
  });

  describe('.cleanup()', () => {
    it('should cleanup all of the composite\'s children.', () => {
      class Sub extends Composite {
        build() {
          this.relay('R');
        }
      }

      let s = new Sub({});
      let o = new OutputPin();
      (s.children.R as Relay).in.connect(o);
      (s.children.R as Relay).out.onActivated.subscribe(() => { throw new Error('this should not have happend.') });
      s.cleanup();
      o.send('hellow');
    });

    it('should cleanup all internal pins as well.', () => {
      class Sub extends Composite {
        build() {
          this.ctrl.onActivated.subscribe(() => { throw new Error('this should not have happened.') });
        }
      }

      let s = new Sub({});
      let i = new SignalPin();
      i.connect(s.control);
      s.cleanup();
      i.activate();
    });
  });
});
