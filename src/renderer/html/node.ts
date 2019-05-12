import { AbstractNode } from '../node';
import _DomEvents from './utils/events';


export class HTMLNode extends AbstractNode<HTMLNode> {
  private _listeners:{[event: string]: any} = {};

  constructor(public native: Node | HTMLElement) {
    super(_DomEvents, _this => {
      _this.native = native;
    });
  }

  protected bindEvent(event: string, listener: (event: any) => void) {
    this.native.addEventListener(event, listener);
  }

  protected getText(): string {
    return this.native.textContent;
  }

  protected setText(content: string) {
    this.native.textContent = content;
  }

  public get attributes(): string[] {
    if (this.supportsAttributes)
      return (this.native as HTMLElement).getAttributeNames();

    return [];
  }

  public getAttribute(name: string): string {
    if (this.supportsAttributes) {
      return (this.native as HTMLElement).getAttribute(name);
    }
  }

  public setAttribute(name: string, content?: string) {
    if (this.supportsAttributes) {
      (this.native as HTMLElement).setAttribute(name, content);
    }
  }

  public get supportsAttributes(): boolean {
    return this.native instanceof HTMLElement;
  }

  public clone(): HTMLNode {
    let clone = new HTMLNode(this.native.cloneNode(false));
    //
    // TODO: write tests for this.
    //
    if (this.children.length == 0) {
      clone.setText(this.getText());
    }

    return clone;
  }

  //
  // TODO: write tests for this.
  //
  // public proxy(node: HTMLNode) {
  //   Object.keys(this._listeners).forEach(event => {
  //     node._activateEvent(event);
  //   })
  //
  //   return super.proxy(node);
  // }

  //
  // TODO: add support for adding before or after a specific child.
  //
  public appendChild(node: HTMLNode) {
    this.native.appendChild(node.native);
  }
}
