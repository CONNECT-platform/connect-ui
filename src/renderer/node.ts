import { State } from '../core/state';
import { Stateful } from '../core/stateful';

import { RenderingNode, RenderingComponent } from './types';


export abstract class AbstractNode<_Child extends AbstractNode<_Child>>
  extends Stateful
  implements RenderingNode<_Child> {

    private _transtag: string;

    constructor(events: string[]) {
      super({
        inputs: ['attr', 'append'],
        outputs: events.concat('appended'),
        states: ['text', 'attributes']
      });
    }

    protected postConstruct() {
      this._bindStates();
      this._bindInputs();
    }

    private _bindInputs() {
      this.inputs.get('attr').onReceived.subscribe(event => {
        if (event.attr)
          this.attr(event.attr, event.value || "");
      });

      this.inputs.get('append').onReceived.subscribe(event => {
        if (event instanceof AbstractNode) {
          this.append(event as _Child);
        }
      });
    }

    private _bindStates() {
      this.state('text').value = this.textContent;
      this.state('attributes').value = {};

      if (this.supportsAttributes)
        this.state('attributes').value = this.attributes.reduce((map: any, val: string) => {
          map[val] = this.getAttribute(val);
          return map;
        }, {});

      this.state('text').onUpdate.subscribe(value => this.setText(value));
      this.state('attributes').onUpdate.subscribe(attrs => {
        if (this.supportsAttributes) {
          Object.entries(attrs).forEach(attr => {
            this.setAttribute(attr[0], (attr[1] as string) || "");
          });
        }
      });
    }

    public get textContent(): string {
      return this.getText();
    }

    public text(text: string): _Child {
      this.state('text').value = text;
      return this as any as _Child;
    }

    public attr(attr: string, content?: string): _Child {
      this.state('attributes').value = Object.assign(
        {},
        this.state('attributes').value,
        { [attr]: content || "" }
      );

      return this as any as _Child;
    }

    public trans(tag: string): _Child { this._transtag = tag; return this as any as _Child; }
    public transtag(): string  { return this._transtag; }

    //
    // TODO: add support for adding before or after a specific child.
    //
    public append(node: _Child): _Child {
      if (!this.children.includes(node)) {
        this.children.push(node);
        this.appendChild(node);

        this.outputs.get('appended').send(node);
      }

      return this as any as _Child;
    }

    public proxy(node: _Child): _Child {
      super.proxy(node);
      this.proxies.push(node);
      return this as any as _Child;
    }

    public abstract get attributes(): string[];
    public abstract clone(): _Child;

    protected abstract get supportsAttributes(): boolean;
    protected abstract getAttribute(name: string): string;
    protected abstract setAttribute(name: string, content?: string): void;

    protected abstract getText(): string;
    protected abstract setText(text: string): void;
    protected abstract appendChild(node: _Child): void;

    public get textState(): State<string> { return this.state('text'); }
    public get attrsState(): State<string> { return this.state('attributes'); }

    public component: RenderingComponent<_Child>;
    public children: _Child[] = [];
    public proxies: _Child[] = [];
  }
