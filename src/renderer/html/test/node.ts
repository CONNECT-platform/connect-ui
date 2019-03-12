import { should, expect } from 'chai'; should();
import 'jsdom-global/register';

import { HTMLRenderer } from '../renderer';
import _DomEvents from '../utils/events';
import { InputPin } from '../../../core/base/io';


//
// TODO: add tests for properly sending output of correspding dom events when the node is a proxy for other nodes.
//
describe('HTMLNode', () => {
  it('should have inputs for all standard dom events.', () => {
    let node = new HTMLRenderer().createNode();
    _DomEvents.forEach(event => {
      node.outputs.has(event).should.be.true;
    });
  });

  it('should send proper data to proper output corresponding to a dom event if the output is connected to another pin.',
    done => {
    let node = new HTMLRenderer().createNode('div');
    let input = new InputPin();
    node.outputs.get('click').connect(input);
    input.onReceived.subscribe(() => done());
    (node.native as HTMLElement).click();
  });

  describe('.getText()', () => {
    it('should return the text of the native element.', () => {
      let node = new HTMLRenderer().createNode().text('hellow');
      (node as any).getText().should.equal('hellow');
    });
  });

  describe('.setText()', () => {
    it('should set the text content of the native element.', () => {
      let node = new HTMLRenderer().createNode();
      (node as any).setText('hellow');
      node.native.textContent.should.equal('hellow');
    });
  });

  describe('.attributes', () => {
    it('should give the list of attribute names of the native element.', () => {
      let node = new HTMLRenderer().createNode('whatever');

      (node.native as HTMLElement).setAttribute('hellow', '');
      (node.native as HTMLElement).setAttribute('world', '42');

      node.attributes.length.should.equal(2);
      node.attributes.should.have.members(['hellow', 'world']);
    });
  });

  describe('.getAttribute()', () => {
    it('should give the value of requested attribute on native element.', () => {
      let node = new HTMLRenderer().createNode('something');

      (node.native as HTMLElement).setAttribute('hellow', 'world');
      (node as any).getAttribute('hellow').should.equal('world');
    });
  });

  describe('.setAttribute()', () => {
    it('should set the value of an attribute on the native element.', () => {
      let node = new HTMLRenderer().createNode('div');

      (node as any).setAttribute('hellow', 'world');
      (node.native as HTMLElement).getAttribute('hellow').should.equal('world');
    });
  });

  describe('.supportsAttributes', () => {
    it('should be true when the node is created for an html element.', () => {
      new HTMLRenderer().createNode('hellow').supportsAttributes.should.be.true;
    });

    it('should be false for text nodes.', () => {
      new HTMLRenderer().createNode().supportsAttributes.should.be.false;
    });
  });

  describe('.appendChild()', () => {
    it('should append the given child node to its native node.', () => {
      let R = new HTMLRenderer();
      let parent = R.createNode('parent');
      let child = R.createNode('child');

      (parent as any).appendChild(child);
      parent.native.childNodes.length.should.equal(1);
      parent.native.childNodes.item(0).should.equal(child.native);
    });
  });

  //
  // TODO: add tests for properly setting text content of non-text node elements.
  //
  describe('.clone()', () => {
    it('should clone the node with its native element.', () => {
      let node = new HTMLRenderer().createNode('elem');
      let clone = node.clone();
      expect(clone).not.to.be.equal(node);
      expect(clone.native).not.to.be.equal(node.native);
      (clone.native as HTMLElement).tagName.should.equal((node.native as HTMLElement).tagName);
    });

    it('should carry over attributes to the cloned node.', done => {
      let node = new HTMLRenderer().createNode('elem');
      let clone = node.attr('a', 'b').clone();

      let input = new InputPin();
      input.onReceived.subscribe((attrs: any) => {
        attrs['a'].should.equal('b');
        done();
      });

      clone.outputs.get('attributes').connect(input);
    });

    it('should carry over text content of a text node.', () => {
      let node = new HTMLRenderer().createNode();
      let clone = node.text('hellow').clone();
      clone.textContent.should.equal('hellow');
    });

    it('should not clone children.', () => {
      let renderer = new HTMLRenderer();
      let parent = renderer.createNode('parent');

      renderer.attachNode(renderer.createNode('child'), parent);
      parent.clone().children.length.should.equal(0);
      parent.clone().native.childNodes.length.should.equal(0);
    });
  });
});
