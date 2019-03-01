import { Renderer } from '../renderer';
import { HTMLNode } from './node';


export class HTMLRenderer extends Renderer<HTMLNode> {
  public attachNode(child: HTMLNode, parent: HTMLNode) {
    if (!parent.children.includes(child)) {
      parent.children.push(child);
      parent.native.appendChild(child.native);
    }

    return this;
  }

  public createNode(tag: string): HTMLNode {
    if (tag) return new HTMLNode(document.createElement(tag));
    else return new HTMLNode(document.createTextNode(''));
  }
}
