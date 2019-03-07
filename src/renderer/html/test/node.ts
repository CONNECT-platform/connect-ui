import { should, expect } from 'chai'; should();
import 'jsdom-global/register';

import { HTMLRenderer } from '../renderer';
import _DomEvents from '../utils/events';
import { InputPin } from '../../../core/base/io';


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

  describe('.inputs.get(\'text\')', () => {
    it('should update the text content of the native element.', () => {
      let node = new HTMLRenderer().createNode();
      node.inputs.get('text').receive('hellow');
      node.native.textContent.should.equal('hellow');
    });

    it('should activate the `text` output with the new text content.', done => {
      let node = new HTMLRenderer().createNode('shit');
      node.outputs.get('text').onSent.subscribe(data => {
        data.should.equal('hellow');
        done();
      });
      node.inputs.get('text').receive('hellow');
    });
  });

  describe('.inputs.get(\'attributes\')', () => {
    it('should append the given attributes to the native element\'s attributes.', () => {
      let node = new HTMLRenderer().createNode('div');
      node.inputs.get('attributes').receive({'a': 'b', 'c': 'd'});
      node.inputs.get('attributes').receive({'c': 'e', 'f': 'g'});

      (node.native as HTMLElement).getAttribute('a').should.equal('b');
      (node.native as HTMLElement).getAttribute('c').should.equal('e');
      (node.native as HTMLElement).getAttribute('f').should.equal('g');
    });

    it('should send all the new attributes to the `attributes` output.', done => {
      let node = new HTMLRenderer().createNode('yo');
      node.outputs.get('attributes').onSent.subscribe(attributes => {
        attributes['hellow'].should.equal('world');
        done();
      });
      node.inputs.get('attributes').receive({'hellow': 'world'});
    });
  });

  describe('.text()', () => {
    it('should set the text content of the native element.', () => {
      let node = new HTMLRenderer().createNode('shit');
      node.text('hellow');
      node.native.textContent.should.equal('hellow');
    });

    it('should activate the `text` output with the new text content.', done => {
      let node = new HTMLRenderer().createNode('shit');
      node.outputs.get('text').onSent.subscribe(data => {
        data.should.equal('hellow');
        done();
      });
      node.text('hellow');
    });
  });

  describe('.attr()', () => {
    it('should add an attribute to the native element.', () => {
      let node = new HTMLRenderer().createNode('yo');
      node.attr('hellow', 'world');
      (node.native as HTMLElement).getAttribute('hellow').should.equal('world');
    });

    it('should update an existing attribute.', () => {
      let node = new HTMLRenderer().createNode('yo');
      node.attr('hellow', 'world');
      node.attr('hellow', 'sword');
      (node.native as HTMLElement).getAttribute('hellow').should.equal('sword');
    });

    it('should send all the new attributes to the `attributes` output.', done => {
      let node = new HTMLRenderer().createNode('yo');
      node.outputs.get('attributes').onSent.subscribe(attributes => {
        attributes['hellow'].should.equal('world');
        done();
      });
      node.attr('hellow', 'world');
    });
  });

  describe('.textContent', () => {
    it('should be the text content of the native element.', () => {
      let node = new HTMLRenderer().createNode();
      node.native.textContent = 'yo';
      node.textContent.should.equal('yo');
    });
  });

  describe('.attributes', () => {
    it('should be an array of all set attribute names of the native element.', () => {
      let node = new HTMLRenderer().createNode('something');
      (node.native as HTMLElement).setAttribute('a', 'b');
      (node.native as HTMLElement).setAttribute('c', 'd');
      node.attributes.length.should.equal(2);
      node.attributes.should.include('a');
      node.attributes.should.include('c');
    });
  });

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

  describe('.append()', () => {
    it('should add a node to its children.', () => {
      let renderer = new HTMLRenderer();
      let parent = renderer.createNode('parent');
      let child = renderer.createNode('child');
      parent.append(child);

      parent.children.length.should.equal(1);
      parent.children[0].should.equal(child);
    });

    it('should also append the native element of the child to its own native element.', () => {
      let renderer = new HTMLRenderer();
      let parent = renderer.createNode('parent');
      let child = renderer.createNode('child');
      parent.append(child);

      parent.native.childNodes.length.should.equal(1);
      parent.native.childNodes.item(0).should.equal(child.native);
    });

    it('should send the added node to `appended` output.', done => {
      let renderer = new HTMLRenderer();
      let parent = renderer.createNode('parent');
      let child = renderer.createNode('child');

      parent.outputs.get('appended').onSent.subscribe(node => {
        node.should.equal(child);
        done();
      });
      parent.append(child);
    });
  });

  describe('.textState', () => {
    it('should be equal to `.state(\'text\')`', () => {
      let node = new HTMLRenderer().createNode('something');
      node.textState.should.equal(node.state('text'));
    });
  });

  describe('.attrsState', () => {
    it('should be equal to `.state(\'attributes\')`', () => {
      let node = new HTMLRenderer().createNode('someotherthing');
      node.attrsState.should.equal(node.state('attributes'));
    });
  });
});
