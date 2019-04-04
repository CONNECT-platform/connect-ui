import { AbstractRenderer } from '../renderer';
import { HTMLNode } from './node';

import './utils/is-connected-polyfill';


export class HTMLRenderer extends AbstractRenderer<HTMLNode> {
  public attachNode(child: HTMLNode, parent: HTMLNode) {
    parent.append(child);
    return this;
  }

  public createNode(tag?: string): HTMLNode {
    if (tag) {
      if (tag.startsWith('@'))
        return new HTMLNode(document.createElement('hook:' + tag.slice(1)))
      else
        return new HTMLNode(document.createElement(tag));
    }
    else {
      return new HTMLNode(document.createTextNode(''));
    }
  }

  //
  // TODO: write tests for this.
  //
  protected attached(node: HTMLNode, host: HTMLNode) {
    if (host.native.isConnected) {
      this._attached(node);
    }
  }

  //
  // TODO: write tests for this.
  //
  private _attached(node: HTMLNode) {
    if (node.component && node.component.attach) {
      node.component.attach();
    }

    node.children.forEach(child => this._attached(child));
  }
}
