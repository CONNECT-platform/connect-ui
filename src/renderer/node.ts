import { State } from '../core/state';
import { Stateful } from '../core/stateful';
import { Agent } from '../core/base/agent';
import { Resource } from '../core/resource';

import { RenderingNode, RenderingComponent } from './types';


export abstract class AbstractNode<_Child extends AbstractNode<_Child>>
  extends Stateful
  implements RenderingNode<_Child> {

    private _transtag: string;
    private _attr_map: {[attr: string]: State<string>};

    constructor(events: string[]) {
      super({
        inputs: ['attr', 'append'],
        outputs: events.concat('appended'), // modify this so that event pins are created lazily.
        states: ['text']
      });

      this._def('cleaned');
    }

    protected postConstruct() {
      this._bindStates();
      this._bindInputs();
    }

    private _bindInputs() {
      this.input('attr').onReceived.subscribe(event => {
        if (event.attr)
          this.attr(event.attr, event.value || "");
      });

      this.input('append').onReceived.subscribe(event => {
        if (event instanceof AbstractNode) {
          this.append(event as _Child);
        }
      });
    }

    private _bindStates() {
      this.state('text').value = this.textContent;

      if (this.supportsAttributes) {
        this.attributes.forEach(attr => this.attr(attr, this.getAttribute(attr)));
      }

      this.state('text').onUpdate.subscribe(value => {
        this.setText(value);
        //
        // TODO: add this to the tests.
        //
        this.children = [];
      });
    }

    public get textContent(): string {
      return this.getText();
    }

    public text(text: string | Resource<string>): _Child {
      if (text instanceof Resource)
        text.out.connect(this.state('text').in);
      else
        this.state('text').value = text;

      return this as any as _Child;
    }

    public attr(attr: string, content?: string | Resource<string>): _Child {
      if (content instanceof Resource) {
        content.out.connect(this.attrState(attr).in);
      }
      else
        this.attrState(attr).value = (content !== undefined)?(content.toString()):"";

      return this as any as _Child;
    }

    public trans(tag: string): _Child { this._transtag = tag; return this as any as _Child; }
    public transtag(): string  { return this._transtag; }

    //
    // TODO: write tests for this.
    //
    public getAttr(attr: string): string {
      return this.attrState(attr).value;
    }

    //
    // TODO: add support for adding before or after a specific child.
    //
    public append(node: _Child): _Child {
      if (!this.children.includes(node)) {
        this.children.push(node);
        this.appendChild(node);

        this.output('appended').send(node);
      }

      return this as any as _Child;
    }

    public proxy(node: _Child): _Child {
      super.proxy(node);
      this.proxies.push(node);
      node.onCleaned.subscribe(() => {
        this.proxies = this.proxies.filter(proxy => proxy != node);
      });
      return this as any as _Child;
    }

    //
    // TODO: write tests for this.
    //
    public cleanup() {
      this._emit('cleaned');
      super.cleanup();

      if (this.component && this.component instanceof Agent)
        this.component.cleanup();

      this.children.forEach(child => child.cleanup());
      this.proxies.forEach(proxy => proxy.cleanup());
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

    public attrState(attr: string): State<string> {
      if (!this._attr_map) this._attr_map = {};
      if (!(attr in this._attr_map)) {
        let _state = this._attr_map[attr] = new State<string>();
        _state.onUpdate.subscribe(value => {
          this.setAttribute(attr, value);
        });

        return _state;
      }
      else return this._attr_map[attr];
    }

    public get onCleaned() { return this.on('cleaned'); }

    public component: RenderingComponent<_Child>;
    public children: _Child[] = [];
    public proxies: _Child[] = [];
  }
