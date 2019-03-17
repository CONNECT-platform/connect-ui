import { should, expect } from 'chai'; should();
import 'jsdom-global/register';

import compile from '../compiler';

import { AbstractComponent } from '../../../renderer/component';
import { RendererType } from '../../../renderer/types';
import { ComponentRegistry, ComponentFactory } from '../../../renderer/component-registry';

import { HTMLNode } from '../../../renderer/html/node';
import { HTMLRenderer } from '../../../renderer/html/renderer';


class _C extends AbstractComponent<HTMLNode> {
  private _code: string;

  constructor(_code: string, renderer: RendererType<HTMLNode>, node: HTMLNode) {
    super({}, renderer, node, (_this) => {
      _this._code = _code;
    });
  }

  render() {
    let _compiled = compile(this._code);
    let _func: () => void = eval(_compiled);
    _func.apply(this);
  }

  clone(node: HTMLNode): _C {
    return new _C(this._code, this.renderer, node);
  }
}

function _c(_code: string): ComponentFactory<HTMLNode> {
  return (renderer: RendererType<HTMLNode>, node: HTMLNode) => {
    return new _C(_code, renderer, node);
  }
}

describe('compiler', () => {
  it('should compile a piece of pseudo-html code into a rendering function applicable on an `AbstractComponent`.', () => {
    let R = new HTMLRenderer(new ComponentRegistry());
    R.registry.register('A', _c(`<span></span>`));

    let host = R.createNode('host');
    R.render('A').on(host);

    host.children[0].children[0].native.nodeName.toLowerCase().should.equal('span');
  });

  it('should create separate text nodes for text.', () => {
    let R = new HTMLRenderer(new ComponentRegistry());
    R.registry.register('A', _c(`<span>hellow</span>`));

    let host = R.createNode('host');
    R.render('A').on(host);

    host.children[0].children[0].children[0].textContent.should.equal('hellow');
  });

  it('should return a rendering function that properly handles non-trivial dom trees.', () => {
    let R = new HTMLRenderer(new ComponentRegistry());
    R.registry.register('A', _c(`
      <div>
        hellow
        <span>world</span>
        from the compiled code
        <span>in <b>HERE</b></span>
      </div>
    `));

    let host = R.createNode('host');
    R.render('A').on(host);

    host.children[0].children[0].native.nodeName.toLowerCase().should.equal('div');
    host.children[0].children[0].children[0].textContent.should.equal('hellow');
    host.children[0].children[0].children[1].native.nodeName.toLowerCase().should.equal('span');
    host.children[0].children[0].children[1].children[0].textContent.should.equal('world');
    host.children[0].children[0].children[2].textContent.should.equal('from the compiled code');
    host.children[0].children[0].children[3].native.nodeName.toLowerCase().should.equal('span');
    host.children[0].children[0].children[3].children[1].native.nodeName.toLowerCase().should.equal('b');
  });

  it('should return a function properly handling self-closing tags even those who are not supported in HTML.', () => {
    let R = new HTMLRenderer(new ComponentRegistry());
    R.registry.register('A', _c(`
      <div>
        hellow
        <span/>
        world!
      </div>
    `));

    let host = R.createNode('host');
    R.render('A').on(host);

    host.children[0].children[0].children[1].native.nodeName.toLowerCase().should.equal('span');
    host.children[0].children[0].children[2].textContent.should.equal('world!');
  });

  it('should retur a function properly handling multiple root nodes.', () => {
    let R = new HTMLRenderer(new ComponentRegistry());
    R.registry.register('A', _c(`<x/><y/>`));

    let host = R.createNode('host');
    R.render('A').on(host);

    host.children[0].children[0].native.nodeName.toLowerCase().should.equal('x');
    host.children[0].children[1].native.nodeName.toLowerCase().should.equal('y');
  });

  it('should add nodes with tags starting with "@" to transclusion hooks of the component.', () => {
    let R = new HTMLRenderer(new ComponentRegistry());
    R.registry.register('A', _c(`<@some-hook/>`));

    let host = R.createNode('host');
    R.render('A').on(host);

    host.children[0].component.hooks('@some-hook').should.include(host.children[0].children[0]);
  });

  it('should return a rendering function that handles attributes properly.', () => {
    let R = new HTMLRenderer(new ComponentRegistry());
    R.registry.register('A', _c(`<span hellow="world"></span>`));

    let host = R.createNode('host');
    R.render('A').on(host);

    (host.children[0].children[0].native as HTMLElement).getAttribute('hellow').should.equal('world');
  });

  it('should skip attributes starting with "@", and instead attach them as trans tag for the resulting node.', () => {
    let R = new HTMLRenderer(new ComponentRegistry());
    R.registry.register('A', _c(`<span @hook></span>`));

    let host = R.createNode('host');
    R.render('A').on(host);

    host.children[0].children[0].attributes.length.should.equal(0);
    host.children[0].children[0].transtag().should.equal('@hook');
  });

  it('should skip attributes starting with "$", and instead store the node in component\'s `$` map.', () => {
    let R = new HTMLRenderer(new ComponentRegistry());
    R.registry.register('A', _c(`<span $something></span>`));

    let host = R.createNode('host');
    R.render('A').on(host);

    host.children[0].children[0].attributes.length.should.equal(0);
    (host.children[0].component as any).$.something.should.equal(host.children[0].children[0]);
  });

  it('should throw proper error in case of mismatching closed tag.', () => {
    let R = new HTMLRenderer(new ComponentRegistry());
    R.registry.register('A', _c(`<some:tag>hellow</some:other:tag>`));

    let host = R.createNode('host');
    expect(() => R.render('A').on(host)).to.throw();
  });

  it('should throw proper error in case of unclosed tag.', () => {
    let R = new HTMLRenderer(new ComponentRegistry());
    R.registry.register('A', _c(`<a><b></b>`));

    let host = R.createNode('host');
    expect(() => R.render('A').on(host)).to.throw();
  });

  it('should throw proper error in case of invalid tag names.', () => {
    let R = new HTMLRenderer(new ComponentRegistry());
    R.registry.register('A', _c(`<2pac/>`));

    let host = R.createNode('host');
    expect(() => R.render('A').on(host)).to.throw();
  });

  it('should throw proper error in case of invalid attribute names.', () => {
    let R = new HTMLRenderer(new ComponentRegistry());
    R.registry.register('A', _c(`<span 2hook></span>`));

    let host = R.createNode('host');
    expect(() => R.render('A').on(host)).to.throw();
  });

  it('should throw proper error in case of invalid $ attribute.', () => {
    let R = new HTMLRenderer(new ComponentRegistry());
    R.registry.register('A', _c(`<span $some:thing></span>`));

    let host = R.createNode('host');
    expect(() => R.render('A').on(host)).to.throw();
  });
});
