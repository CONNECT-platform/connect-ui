import { Topic } from '../core/base/topic';

import { RenderingNode, RenderingComponent,
    RenderingRequestType, RendererType } from './types';

import registry from './component-registry';
import { ComponentRegistry } from './component-registry';


export type RenderCallback<_Node extends RenderingNode<_Node>> =
  (node: _Node, host: _Node) => void;

export class RenderingRequest<_Node extends RenderingNode<_Node>>
    implements RenderingRequestType<_Node> {

  constructor(
    private target: _Node,
    private callback: RenderCallback<_Node>,
  ) {}

  public text(text: string): RenderingRequest<_Node> {
    this.target.text(text);
    return this;
  }

  public attr(attr: string, content?: string): RenderingRequest<_Node> {
    this.target.attr(attr, content);
    return this;
  }

  public on(host: _Node): _Node {
    this.callback(this.target, host);
    return this.target;
  }
}

export abstract class Renderer<_Node extends RenderingNode<_Node>> extends Topic
    implements RendererType<_Node> {

  protected issuer: RenderingComponent<_Node>;

  constructor(protected _registry: ComponentRegistry = registry) {
    super();
  }

  public abstract createNode(tag: string): _Node;
  public abstract attachNode(child: _Node, parent: _Node): Renderer<_Node>;

  public render(tag: string): RenderingRequest<_Node> {
    let node = this.createNode(tag);
    let component = this._registry.create(tag, this, node);

    if (component)
      node.component = component;

    return new RenderingRequest<_Node>(node, (node, host) => this._render(tag, node, host));
  }

  private _render(tag: string, node: _Node, host: _Node) {
    if (host.component && host.component.hooks && host.component != this.issuer) {
      let transtag = node.attributes().find(attr => attr.startsWith('@')) || '@';
      host.component.hooks(transtag).forEach(hook => {
        this._renderTrans(node, hook);
      });
    }
    else {
      this.attachNode(node, host);

      if (this.issuer && this.issuer.hook && tag.startsWith('@')) {
        this.issuer.hook(tag, node);
      }
    }
  }

  private _renderTrans(node: _Node, hook: _Node) {
    let transnode = node.clone();

    if (node.component) {
      let transcomp = node.component.clone(transnode);
      transnode.component = transcomp;
    }

    this.attachNode(transnode, hook);
  }

  public get registry(): ComponentRegistry { return this._registry; }

  public within(component: RenderingComponent<_Node>): Renderer<_Node> {
    return new ProxyRenderer<_Node>(this, component);
  }
}

class ProxyRenderer<_Node extends RenderingNode<_Node>> extends Renderer<_Node> {
  constructor(
    private renderer: Renderer<_Node>,
    protected issuer: RenderingComponent<_Node>) {
    super();
    this._registry = renderer.registry;
  }

  public createNode(tag: string): _Node {
    return this.renderer.createNode(tag);
  }

  public attachNode(child: _Node, parent: _Node): ProxyRenderer<_Node> {
    this.renderer.attachNode(child, parent);
    return this;
  }
}
