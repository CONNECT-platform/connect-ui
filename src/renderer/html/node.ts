import { AbstractNode } from '../node';
import _DomEvents from './utils/events';


export class HTMLNode extends AbstractNode<HTMLNode> {
  private _listeners:{[event: string]: any} = {};

  constructor(public native: Node | HTMLElement) {
    super(_DomEvents);

    this.postConstruct();
    this._bindDOMEvents();
  }

  private _bindDOMEvents() {
    _DomEvents.forEach(event => {
      this.outputs.get(event).onConnected.subscribe(() => {
        this._activateEvent(event);
      });
    });
  }

  private _activateEvent(event: string) {
    if (!(event in this._listeners)) {
      let out = this.outputs.get(event);
      let listener = this._listeners[event] = ($event: any) => {
        out.send($event);
      };

      this.proxies.forEach(proxy => {
        proxy._activateEvent(event);
      });

      this.native.addEventListener(event, listener);
    }
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

  private get _onlyText(): boolean {
    if (this.children.length == 0) return true;
    if (this.children.length == 1) {
      if (this.children[0].children.length == 0) return true;
    }

    return false;
  }

  //
  // TODO: add support for adding before or after a specific child.
  //
  public appendChild(node: HTMLNode) {
    this.native.appendChild(node.native);
  }
}
