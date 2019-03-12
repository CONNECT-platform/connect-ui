import { should, expect } from 'chai'; should();

import { AbstractNode } from '../node';


class _Node extends AbstractNode<_Node> {
  _text: string = '';
  _attrs: {[name: string]: string} = {};

  constructor(private events: string[] = []) {
    super(events);
    this.postConstruct();
  }

  protected getText() { return this._text; }
  protected setText(text: string) { this._text = text; }
  protected getAttribute(name: string) { return this._attrs[name]; }
  protected setAttribute(name: string, content?: string) { this._attrs[name] = content; }
  protected get supportsAttributes() { return true; }
  protected appendChild(_: _Node) {}

  public get attributes(): string[] { return Object.keys(this._attrs); }
  public clone() { return new _Node(this.events); }
}


//
// TODO: add tests for `.proxy()`
// TODO: add tests for `.trans()`
// TODO: add tests for `.transtag()`
//
describe('AbstractNode', () => {
  it('should have inputs for all given events.', () => {
    let node = new _Node(['a', 'b']);
    ['a', 'b'].forEach(event => {
      node.outputs.has(event).should.be.true;
    });
  });

  describe('.inputs.get(\'text\')', () => {
    it('should call the `setText()` child method.', done => {
      class _N extends _Node {
        setText(text: string) {
          text.should.equal('hellow');
          done();
        }
      }

      new _N().setText('hellow');
    });

    it('should activate the `text` output with the new text content.', done => {
      let node = new _Node();
      node.outputs.get('text').onSent.subscribe(data => {
        data.should.equal('hellow');
        done();
      });
      node.inputs.get('text').receive('hellow');
    });
  });

  describe('.inputs.get(\'attributes\')', () => {
    it('should invoke the `setAttribute()` method on child classes.', done => {
      class _N extends _Node {
        setAttribute(name: string, content?: string) {
          name.should.equal('a');
          content.should.equal('b');
          done();
        }
      }

      new _N().inputs.get('attributes').receive({'a': 'b'});
    });

    it('should send all the new attributes to the `attributes` output.', done => {
      let node = new _Node();
      node.outputs.get('attributes').onSent.subscribe(attributes => {
        attributes['hellow'].should.equal('world');
        done();
      });
      node.inputs.get('attributes').receive({'hellow': 'world'});
    });
  });

  describe('.text()', () => {
    it('should invoke the `setText()` method of child class.', done => {
      class _N extends _Node {
        setText(text: string) {
          text.should.equal('hellow');
          done();
        }
      }
      new _N().text('hellow');
    });

    it('should activate the `text` output with the new text content.', done => {
      let node = new _Node();
      node.outputs.get('text').onSent.subscribe(data => {
        data.should.equal('hellow');
        done();
      });
      node.text('hellow');
    });
  });

  describe('.attr()', () => {
    it('should invoke the `setAttribute()` method of the child class.', done => {
      class _N extends _Node {
        setAttribute(name: string, content?: string) {
          name.should.equal('hellow');
          content.should.equal('world');
          done();
        }
      }

      new _N().attr('hellow', 'world');
    });

    it('should send all the new attributes to the `attributes` output.', done => {
      let node = new _Node();
      node.outputs.get('attributes').onSent.subscribe(attributes => {
        attributes['hellow'].should.equal('world');
        done();
      });
      node.attr('hellow', 'world');
    });
  });

  describe('.textContent', () => {
    it('should be the value of `getText()` function of child class.', () => {
      class _N extends _Node {
        getText() { return 'yo'; }
      }
      new _N().textContent.should.equal('yo');
    });
  });

  describe('.append()', () => {
    it('should add a node to its children.', () => {
      let parent = new _Node();
      let child = new _Node();
      parent.append(child);

      parent.children.length.should.equal(1);
      parent.children[0].should.equal(child);
    });

    it('should invoke the `appendChild()` method of the child class.', done => {
      class _N extends _Node {
        appendChild(_child: _N) {
          _child.should.equal(child);
          done();
        }
      }

      let parent = new _N();
      let child = new _N();
      parent.append(child);
    });

    it('should send the added node to `appended` output.', done => {
      let parent = new _Node();
      let child = new _Node();

      parent.outputs.get('appended').onSent.subscribe(node => {
        node.should.equal(child);
        done();
      });
      parent.append(child);
    });
  });

  describe('.textState', () => {
    it('should be equal to `.state(\'text\')`', () => {
      let node = new _Node();
      node.textState.should.equal(node.state('text'));
    });
  });

  describe('.attrsState', () => {
    it('should be equal to `.state(\'attributes\')`', () => {
      let node = new _Node();
      node.attrsState.should.equal(node.state('attributes'));
    });
  });
});