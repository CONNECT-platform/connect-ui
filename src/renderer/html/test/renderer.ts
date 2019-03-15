import { should, expect } from 'chai'; should();
import 'jsdom-global/register';

import { HTMLRenderer } from '../renderer';
import { HTMLNode } from '../node';


describe('HTMLRenderer', () => {
  describe('.createNode()', () => {
    it('should create an `HTMLNode`', () => {
      new HTMLRenderer().createNode().should.be.instanceOf(HTMLNode);
    });

    it('should create an `HTMLNode` whose native is an `HTMLElement` with given tag.', () => {
      let node = new HTMLRenderer().createNode('some-tag');
      expect(node.native).to.be.instanceOf(HTMLElement);
      (node.native as HTMLElement).tagName.toLowerCase().should.equal('some-tag');
    });

    it('should create an `HTMLNode` whose native is a basic `Text` when no tag is specified.', () => {
      let node = new HTMLRenderer().createNode();
      node.native.should.be.instanceOf(Text);
    });

    it('should create an `HTMLNode` whose tagname starts with "@"', () => {
      new HTMLRenderer().createNode('@hellow');
    });
  });

  describe('.attachNode()', () => {
    it('should append a node to another.', () => {
      let r = new HTMLRenderer();
      let parent = r.createNode('parent');
      let child = r.createNode('child');
      r.attachNode(child, parent);

      parent.children.length.should.equal(1);
      parent.children[0].should.equal(child);
    });
  });
});
