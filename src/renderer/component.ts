import { RenderingComponent, RendererType } from './types';
import { AbstractNode } from './node';
import { Context } from './context';

import { Signature } from '../core/base/signature';
import { Composite } from '../core/composite';


export abstract class AbstractComponent<_Node extends AbstractNode<_Node>> extends Composite
  implements RenderingComponent<_Node> {

  private _renderer: RendererType<_Node>;
  private _hooks: {[tag: string]: _Node} = {};
  private _proxies: AbstractComponent<_Node>[] = [];
  $: {[name: string]: _Node} = {};
  protected _context: Context;

  constructor(signature: Signature,
      renderer: RendererType<_Node>,
      private _node: _Node,
      _initCallback?: (_this: any) => void,
    ) {

    super(signature);

    this.adopt(renderer);
    this._def('cleaned');

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

  //
  // TODO: write tests for this. it should cause the component to drop its transclusion mechanism
  //       and delegate the attachment of nodes to its root node to the renderer.
  //
  protected renderTransient() {
    this.getHook = undefined;
  }

  //
  // TODO: write tests for this.
  //
  public context(context: Context): AbstractComponent<_Node> {
    if (context) {
      if (!this._context) this._context = new Context();
      this._context.inherit(context);
    }
    return this;
  }

  public get renderer() { return this._renderer; }
  public get root() { return this._node; }

  hook(tag: string, node: _Node): AbstractComponent<_Node> {
    this._hooks[tag] = node;
    return this;
  }

  getHook(tag: string): _Node {
    return this._hooks[tag];
  }

  public get hooktags(): string[] {
    return Object.keys(this._hooks);
  }

  //
  // TODO: write tests for this.
  //
  public proxy(component: AbstractComponent<_Node>): AbstractComponent<_Node> {
    super.proxy(component);
    this._proxies.push(component);

    this.inputs.entries.forEach(entry => {
      if (entry.pin.activated && component.inputs.has(entry.tag))
        component.inputs.get(entry.tag).receive(entry.pin.last);
    });

    if (this.ctrl.activated) component.ctrl.activate();

    component.onCleaned.subscribe(() => {
      this._proxies = this._proxies.filter(proxy => proxy != component);
    });

    return this;
  }

  //
  // TODO: write tests for this.
  //
  public cleanup() {
    this._emit('cleaned');
    super.cleanup();
    this._proxies.forEach(proxy => proxy.cleanup());
  }

  public abstract clone(node?: _Node): AbstractComponent<_Node>;

  public get onCleaned() { return this.on('cleaned'); }
}
