import { RenderingComponent, RendererType } from './types';
import { HTMLNode } from './html/node';

import { Signature } from '../core/base/signature';
import { Composite } from '../core/composite';


//
// TODO: abstract away HTMLNode into a parent class and make this guy
// a component for that parent node class.
//
export abstract class Component extends Composite
  implements RenderingComponent<HTMLNode> {

  private _renderer: RendererType<HTMLNode>;
  protected $: {[name: string]: HTMLNode} = {};

  constructor(signature: Signature,
    private _node: HTMLNode,
    renderer: RendererType<HTMLNode>) {

    super(signature);
    this._renderer = renderer.within(this);

    this.render();
    this.wire();
  }

  protected render() {}
  protected wire() {}

  public get renderer() { return this._renderer; }
  public get root() { return this._node; }

  protected abstract _clone(node: HTMLNode): Component;

  clone(node: HTMLNode): Component {
    let clone = this._clone(node);

    //
    // TODO: proxy both the component and the native node.
    //

    return clone;
  }
}
