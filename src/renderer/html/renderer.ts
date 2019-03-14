import { AbstractRenderer } from '../renderer';
import { HTMLNode } from './node';


export class HTMLRenderer extends AbstractRenderer<HTMLNode> {
  public attachNode(child: HTMLNode, parent: HTMLNode) {
    parent.append(child);
    return this;
  }

  public createNode(tag?: string): HTMLNode {
    if (tag)
      return new HTMLNode(document.createElement(tag));
    else
      return new HTMLNode(document.createTextNode(''));
  }
}
