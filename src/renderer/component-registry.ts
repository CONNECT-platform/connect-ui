import { RenderingNode, RenderingComponent } from './types';


export type ComponentFactory<_Node extends RenderingNode<_Node>> = () => RenderingComponent<_Node>;

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

  public create(tag: string): RenderingComponent<any> {
    if (this.registered(tag)) {
      return this._map[tag]();
    }
  }
}

export default new ComponentRegistry();
