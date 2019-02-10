import { RenderingNode, RenderingComponent, RendererType } from './types';


export type ComponentFactory<_Node extends RenderingNode<_Node>> =
  (renderer: RendererType<_Node>, node: RenderingNode<_Node>) => RenderingComponent<_Node>;

export class ComponentRegistry {
  private _map: {[tag: string]: ComponentFactory<any>} = {};

  public register<_Node extends RenderingNode<_Node>>(tag: string, factory: ComponentFactory<_Node>):
      ComponentRegistry {
    this._map[tag] = factory;
    return this;
  }

  public registered(tag: string): boolean {
    return tag in this._map;
  }

  public create<_Node extends RenderingNode<_Node>>(
      tag: string,
      renderer: RendererType<_Node>,
      node: RenderingNode<_Node>,
    ): RenderingComponent<_Node> {
    if (this.registered(tag)) {
      return this._map[tag](renderer, node);
    }
  }
}

export default new ComponentRegistry();
