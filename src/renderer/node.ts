import { Topic } from '../core/base/topic';
import { Signature } from '../core/base/signature';
import { InputPin, OutputPin } from '../core/base/io';
import { AgentLike } from '../core/base/agent-like';
import { Agent } from '../core/base/agent';
import { State } from '../core/state';
//import { Stateful } from '../core/stateful';
import { Resource } from '../core/resource';

import { RenderingNode, RenderingComponent } from './types';


export abstract class AbstractNode<_Child extends AbstractNode<_Child>>
  extends Topic
  //extends Stateful
  implements RenderingNode<_Child>, AgentLike {

    private _transtag: string;
    private _attr_map: {[attr: string]: State<string>};
    private _text_state: State<string>;
    private _append_input: InputPin<_Child>;
    private _appended_output: OutputPin<_Child>;
    private _event_outputs: {[event: string]: OutputPin<any>} = {};

    readonly signature: Signature;

    constructor(private events: string[], preConstruct?: (_this:any) => void) {
      super();

      this.signature = {
        inputs: ['text', 'append'],
        outputs: events.concat(['text', 'appended'])
      };

      this._text_state = new State<string>()
      this._append_input = new InputPin<_Child>();
      this._appended_output = new OutputPin<_Child>();

      if (preConstruct) preConstruct(this);

      this._def('cleaned');
      this._bindStates();
      this._bindInputs();
    }

    private _bindInputs() {
      this._append_input.onReceived.subscribe(event => {
        if (event instanceof AbstractNode) {
          this.append(event as _Child);
        }
      });
    }

    private _bindStates() {
      this._text_state.value = this.textContent;

      if (this.supportsAttributes) {
        this.attributes.forEach(attr => this.attr(attr, this.getAttribute(attr)));
      }

      this._text_state.onUpdate.subscribe(value => {
        this.setText(value);
        this.children = [];
      });
    }

    public input(tag: string): InputPin<any> {
      if (tag == 'append') return this._append_input;
      if (tag == 'text') return this._text_state.in;
      return undefined;
    }

    public output(tag: string): OutputPin<any> {
      if (tag == 'appended') return this._appended_output;
      if (tag == 'text') return this._text_state.out;
      if (this.events.includes(tag)) {
        if (tag in this._event_outputs) return this._event_outputs[tag];
        let pin = this._event_outputs[tag] = new OutputPin<any>();
        this.bindEvent(tag, (event: any) => pin.send(event));

        this.proxies.forEach(proxy => {
          proxy.output(tag).onSent.subscribe(data => {
            pin.send(data);
          });
        });

        return pin;
      }

      return undefined;
    }

    public get textContent(): string {
      return this.getText();
    }

    public text(text: string | Resource<string>): _Child {
      if (text instanceof Resource)
        text.out.connect(this._text_state.in);
      else
        this._text_state.value = text;

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

        this._appended_output.send(node);
      }

      return this as any as _Child;
    }

    public proxy(node: _Child): _Child {
      this._text_state.proxy(node._text_state);
      this._append_input.onReceived.subscribe(value => node._append_input.receive(value));

      Object.entries(this._attr_map).forEach(([attr, state]) => {
        state.proxy(node.attrState(attr));
      });

      Object.entries(this._event_outputs).forEach(([event, pin]) => {
        node.output(event).onSent.subscribe(data => pin.send(data));
      });

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
      super.cleanup();

      Object.values(this._attr_map).forEach(attrState => attrState.cleanup());
      Object.values(this._event_outputs).forEach(pin => pin.cleanup());

      this._text_state.cleanup();
      this._append_input.cleanup();
      this._appended_output.cleanup();

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
    protected abstract bindEvent(event: string, listener: (event: any) => void): void;

    public get textState(): State<string> { return this._text_state; }

    public attrState(attr: string): State<string> {
      if (!this._attr_map) this._attr_map = {};
      if (!(attr in this._attr_map)) {
        let _state: State<string>;

        if (this.attributes.includes(attr))
          _state = this._attr_map[attr] = new State<string>(this.getAttribute(attr));
        else
          _state = this._attr_map[attr] = new State<string>();

        _state.onUpdate.subscribe(value => {
          this.setAttribute(attr, value);
        });

        this.proxies.forEach(proxy => {
          _state.proxy(proxy.attrState(attr));
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
