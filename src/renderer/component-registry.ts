import { Observable } from 'rxjs/Observable';

import { Topic } from '../core/base/topic';
import { RenderingNode, RenderingComponent, RendererType } from './types';


export type ComponentFactory<_Node extends RenderingNode<_Node>> =
  (renderer: RendererType<_Node>, node: RenderingNode<_Node>) => RenderingComponent<_Node>;

export class ComponentRegistry extends Topic {
  private _map: {[tag: string]: ComponentFactory<any>} = {};

  constructor() {
    super();

    this._def('registered');
    this._def('created');
  }

  public register<_Node extends RenderingNode<_Node>>(tag: string, factory: ComponentFactory<_Node>):
      ComponentRegistry {
    this._map[tag] = factory;
    this._emit('registered', {tag, factory});
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
      let created = this._map[tag](renderer, node);
      this._emit('created', {tag, created});
      return created;
    }
  }

  public get onRegistered(): Observable<{tag: string, factory: ComponentFactory<any>}> { return this.on('registered'); }
  public get onCreated(): Observable<{tag: string, created: any}> { return this.on('created'); }
}

export default new ComponentRegistry();
