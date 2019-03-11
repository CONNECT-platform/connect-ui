import { AbstractNode } from '../node';
import _DomEvents from './utils/events';


export class HTMLNode extends AbstractNode<HTMLNode> {
  private _listeners:{[event: string]: any} = {};

  constructor(public native: Node | HTMLElement) {
    super(_DomEvents.concat(['appended']));

    this.postConstruct();
    this._bindDOMEvents();
  }

  private _bindDOMEvents() {
    _DomEvents.forEach(event => {
      let out = this.outputs.get(event);

      out.onConnected.subscribe(() => {
        if (!(event in this._listeners)) {
          let listener = this._listeners[event] = ($event: any) => {
            out.send($event);
          };

          this.native.addEventListener(event, listener);
        }
      });
    });
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
    return new HTMLNode(this.native.cloneNode(false));
  }

  //
  // TODO: add support for adding before or after a specific child.
  //
  public appendChild(node: HTMLNode) {
    this.native.appendChild(node.native);
  }
}
