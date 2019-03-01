import { State } from '../../core/state';
import { Stateful } from '../../core/stateful';

import { RenderingNode, RenderingComponent } from '../types';
import _DomEvents from './utils/events';


export class HTMLNode extends Stateful implements RenderingNode<HTMLNode> {
  private _listeners:{[event: string]: any} = {};

  constructor(public native: Node | HTMLElement) {
    super({
      outputs: _DomEvents,
      states: ['text', 'attributes']
    });

    this.state('text').value = '';
    this.state('attributes').value = {};

    this.state('text').onUpdate.subscribe(value => this.native.textContent = value);
    this.state('attributes').onUpdate.subscribe(attrs => {
      if (this.native instanceof HTMLElement) {
        Object.entries(attrs).forEach(attr => {
          (this.native as HTMLElement).setAttribute(attr[0], (attr[1] as string) || "");
        });
      }
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
    this.state('text').value = text;
    return this;
  }

  public get textContent(): string {
    return this.native.textContent;
  }

  public attr(attr: string, content?: string): HTMLNode {
    this.state('attributes').value = Object.assign(this.state('attributes').value,
      {
        [attr]: content || ""
      });

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

  public get textState(): State<string> { return this.state('text'); }
  public get attrsState(): State<string> { return this.state('attributes'); }

  public component: RenderingComponent<HTMLNode>;
  public children: HTMLNode[] = [];
}
