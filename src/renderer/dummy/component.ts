import { RenderingComponent } from '../types';
import { DummyNode } from './node';


export class DummyComponent implements RenderingComponent<DummyNode> {
  private _hooks: {[tag: string]: DummyNode[]} = {};

  hook(tag: string, node: DummyNode): DummyComponent {
    if (!this._hooks[tag]) this._hooks[tag] = [];
    this._hooks[tag].push(node);
    return this;
  }

  hooks(tag: string): DummyNode[] {
    return this._hooks[tag] || [];
  }

  clone(node: DummyNode): DummyComponent {
    return new DummyComponent();
  }
}
