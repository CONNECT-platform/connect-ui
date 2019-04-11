import { RenderingComponent, RendererType } from './types';
import { AbstractNode } from './node';

import { Signature } from '../core/base/signature';
import { Composite } from '../core/composite';


export abstract class AbstractComponent<_Node extends AbstractNode<_Node>> extends Composite
  implements RenderingComponent<_Node> {

  private _renderer: RendererType<_Node>;
  private _hooks: {[tag: string]: _Node[]} = {};
  private _proxies: AbstractComponent<_Node>[] = [];
  $: {[name: string]: _Node} = {};

  constructor(signature: Signature,
      renderer: RendererType<_Node>,
      private _node: _Node,
      _initCallback?: (_this: any) => void,
    ) {

    super(signature);

    this.adopt(renderer);

    if (_initCallback) _initCallback(this);

    this.render();
    this.wire();
  }

  protected render() {}
  protected wire() {}

  //
  // TODO: write tests for this.
  //
  protected adopt(renderer: RendererType<_Node>) {
    this._renderer = renderer.within(this);
  }

  public get renderer() { return this._renderer; }
  public get root() { return this._node; }

  hook(tag: string, node: _Node): AbstractComponent<_Node> {
    if (!this._hooks[tag]) this._hooks[tag] = [];
    this._hooks[tag].push(node);
    return this;
  }

  hooks(tag: string): _Node[] {
    return this._hooks[tag] || [];
  }

  public get hooktags(): string[] {
    return Object.keys(this._hooks);
  }

  public proxy(component: AbstractComponent<_Node>): AbstractComponent<_Node> {
    super.proxy(component);
    this._proxies.push(component);
    return this;
  }

  //
  // TODO: write tests for this.
  //
  public cleanup() {
    super.cleanup();
    this.root.cleanup();
    this._proxies.forEach(proxy => proxy.cleanup());
  }

  public abstract clone(node?: _Node): AbstractComponent<_Node>;
}
