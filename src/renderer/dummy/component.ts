import { RenderingComponent } from '../types';
import { DummyNode } from './node';


export class DummyComponent implements RenderingComponent<DummyNode> {
  private _hooks: {[tag: string]: DummyNode} = {};
  public proxies: DummyComponent[] = [];

  $: {[name: string]: DummyNode} = {};

  hook(tag: string, node: DummyNode): DummyComponent {
    this._hooks[tag] = node;
    return this;
  }

  getHook(tag: string): DummyNode {
    return this._hooks[tag];
  }

  clone(node: DummyNode): DummyComponent {
    return new DummyComponent();
  }

  proxy(comp: DummyComponent): DummyComponent {
    this.proxies.push(comp);
    return this;
  }
}
