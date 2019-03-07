import { State } from '../../core/state';
import { Stateful } from '../../core/stateful';

import { RenderingNode, RenderingComponent } from '../types';
import _DomEvents from './utils/events';


export class HTMLNode extends Stateful implements RenderingNode<HTMLNode> {
  private _listeners:{[event: string]: any} = {};

  constructor(public native: Node | HTMLElement) {
    super({
      inputs: ['attr', 'append'],
      outputs: _DomEvents.concat(['appended']),
      states: ['text', 'attributes']
    });

    this._bindStates();
    this._bindDOMEvents();
    this._bindInputs();
  }

  private _bindInputs() {
    this.inputs.get('attr').onReceived.subscribe(event => {
      if (event.attr)
        this.attr(event.attr, event.value || "");
    });

    this.inputs.get('append').onReceived.subscribe(event => {
      if (event instanceof HTMLNode)
        this.append(event);
    });
  }

  private _bindStates() {
    this.state('text').value = this.native.textContent;
    this.state('attributes').value = {};

    if (this.native instanceof HTMLElement)
      this.state('attributes').value = this.native.getAttributeNames().reduce((map: any, val: string) => {
        map[val] = (this.native as HTMLElement).getAttribute(val);
        return map;
      }, {});

    this.state('text').onUpdate.subscribe(value => this.native.textContent = value);
    this.state('attributes').onUpdate.subscribe(attrs => {
      if (this.native instanceof HTMLElement) {
        Object.entries(attrs).forEach(attr => {
          (this.native as HTMLElement).setAttribute(attr[0], (attr[1] as string) || "");
        });
      }
    });
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

  public text(text: string): HTMLNode {
    this.state('text').value = text;
    return this;
  }

  public get textContent(): string {
    return this.native.textContent;
  }

  public attr(attr: string, content?: string): HTMLNode {
    this.state('attributes').value = Object.assign(
      {},
      this.state('attributes').value,
      { [attr]: content || "" }
    );

    return this;
  }

  public get attributes(): string[] {
    if (this.native instanceof HTMLElement)
      return this.native.getAttributeNames();

    return [];
  }

  public clone(): HTMLNode {
    return new HTMLNode(this.native.cloneNode(false));
  }

  //
  // TODO: add support for adding before or after a specific child.
  //
  public append(node: HTMLNode): HTMLNode {
    if (!this.children.includes(node)) {
      this.children.push(node);
      this.native.appendChild(node.native);

      this.outputs.get('appended').send(node);
    }

    return this;
  }

  public get textState(): State<string> { return this.state('text'); }
  public get attrsState(): State<string> { return this.state('attributes'); }

  public component: RenderingComponent<HTMLNode>;
  public children: HTMLNode[] = [];
}
