import { Agent } from '../../core/base/agent';

import { RenderingNode, RenderingComponent } from '../types';
import _DomEvents from './utils/events';


export class HTMLNode extends Agent implements RenderingNode<HTMLNode> {
  private _listeners:{[event: string]: any} = {};

  constructor(public native: Node | HTMLElement) {
    super({
      outputs: _DomEvents
    });

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

  public text(text: string): HTMLNode {
    this.native.textContent = text;
    return this;
  }

  public get textContent(): string {
    return this.native.textContent;
  }

  public attr(attr: string, content?: string): HTMLNode {
    if (this.native instanceof HTMLElement) {
      this.native.setAttribute(attr, content || "");
    }

    return this;
  }

  public attributes(): string[] {
    if (this.native instanceof HTMLElement)
      return this.native.getAttributeNames();

    return [];
  }

  public clone(): HTMLNode {
    return new HTMLNode(this.native.cloneNode(false));
  }

  public component: RenderingComponent<HTMLNode>;
  public children: HTMLNode[] = [];
}
