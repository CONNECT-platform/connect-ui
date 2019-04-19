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
    if (attr.startsWith('@')) {
      if (this.target.trans)
        this.target.trans(attr);
    } else
      this.target.attr(attr, content);
    return this;
  }

  public on(host: _Node): _Node {
    this.callback(this.target, host);
    return this.target;
  }
}

export abstract class AbstractRenderer<_Node extends RenderingNode<_Node>> extends Topic
    implements RendererType<_Node> {

  protected issuer: RenderingComponent<_Node>;

  constructor(protected _registry: ComponentRegistry = registry) {
    super();
  }

  public abstract createNode(tag: string): _Node;
  public abstract attachNode(child: _Node, parent: _Node): AbstractRenderer<_Node>;

  public render(tag: string): RenderingRequest<_Node> {
    let node = this.createNode(tag);
    let component = this._registry.create(tag, this, node);

    if (component)
      node.component = component;

    return this.renderNode(tag, node);
  }

  public renderNode(tag: string, node: _Node): RenderingRequest<_Node> {
    return new RenderingRequest<_Node>(node, (node, host) => this._render(tag, node, host));
  }

  public renderClone(tag: string, node: _Node): RenderingRequest<_Node> {
    return this.renderNode(tag, this._proxyClone(node));
  }

  public virtualHook(tag: string) {
    if (this.issuer && this.issuer.hook)
      this.issuer.hook(tag, this.createNode(tag));

    return this;
  }

  private _render(tag: string, node: _Node, host: _Node) {
    if (host.component && host.component.hooks && host.component != this.issuer) {
      let transtag = (node.transtag?node.transtag():undefined) || '@';
      host.component.hooks(transtag).forEach(hook => {
        this._attachNode(this._proxyClone(node), hook);
      });
    }
    else {
      this._attachNode(node, host);

      if (this.issuer && this.issuer.hook && tag.startsWith('@')) {
        this.issuer.hook(tag, node);
      }
    }
  }

  private _attachNode(node: _Node, host: _Node) {
    this.attachNode(node, host);
    this.attached(node, host);

    if (host.proxies && host.proxies.length > 0) {
      host.proxies.forEach(proxy => {
        this._attachNode(this._proxyClone(node), proxy);
      });
    }
  }

  protected attached(_: _Node, __: _Node) {
    //
    // TODO: write tests for this.
    //
  }

  private _proxyClone(node: _Node): _Node {
    let clone = this.clone(node);

    if (node.proxy) node.proxy(clone);

    if (node.component && node.component.proxy)
      node.component.proxy(clone.component);

    return clone;
  }

  public clone(node: _Node): _Node {
    let clone = node.clone();

    if (node.component) {
      clone.component = node.component.clone(clone);
    }

    if (node.children) {
      //
      // TODO: write tests for this.
      //
      if (node.component && node.component.hooks) {
        (node.component.hooktags || []).forEach(tag => {
          let clonehooks = clone.component.hooks(tag);
          node.component.hooks(tag).forEach((hook, index) => {
            let clonehook = clonehooks[index];
            hook.proxy(clonehook);

            hook.children.forEach(child => {
              //
              // TODO: study whether this should be proxy clone or simple clone.
              //
              this.attachNode(this._proxyClone(child), clonehook);
            });
          });
        });
      }
      else {
        node.children.forEach(child => {
          //
          // TODO: study whether this should be proxy clone or simple clone.
          //
          this.attachNode(this._proxyClone(child), clone);
        });
      }
    }

    return clone;
  }

  public get registry(): ComponentRegistry { return this._registry; }

  public within(component: RenderingComponent<_Node>): AbstractRenderer<_Node> {
    return new ProxyRenderer<_Node>(this, component);
  }
}

class ProxyRenderer<_Node extends RenderingNode<_Node>> extends AbstractRenderer<_Node> {
  constructor(
    private renderer: AbstractRenderer<_Node>,
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
