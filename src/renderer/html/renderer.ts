import { Renderer } from '../renderer';
import { HTMLNode } from './node';


//
// TODO: write tests for this.
//
export class HTMLRenderer extends Renderer<HTMLNode> {
  public attachNode(child: HTMLNode, parent: HTMLNode) {
    parent.append(child);
    return this;
  }

  public createNode(tag: string): HTMLNode {
    if (tag) return new HTMLNode(document.createElement(tag));
    else return new HTMLNode(document.createTextNode(''));
  }
}
