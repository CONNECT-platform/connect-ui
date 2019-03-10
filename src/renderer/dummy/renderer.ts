import { AbstractRenderer } from '../renderer';
import { DummyNode } from './node';


export class DummyRenderer extends AbstractRenderer<DummyNode> {
  public attachNode(child: DummyNode, parent: DummyNode) {
    if (!parent.children.includes(child))
      parent.children.push(child);
    return this;
  }

  public createNode(tag: string) {
    return new DummyNode(tag);
  }
}
