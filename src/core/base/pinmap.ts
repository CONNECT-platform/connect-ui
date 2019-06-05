import { Observable } from 'rxjs/Observable';

import { Topic } from './topic';
import { Pin } from './pin';


export class PinMap<_PinType extends Pin> extends Topic {
  private _map: { [tag: string]: _PinType } = {};
  private _lazyMap: { [tag: string]: () => _PinType} = {};
  private _tags: string[] = [];
  private _locked: boolean = false;
  private _proxy: PinMap<_PinType> = undefined;

  constructor() {
    super();

    this._def<void>('locked');
    this._def<{tag: string, pin: _PinType}>('attached');
    this._def<{tag: string, pin: _PinType}>('detached');
  }

  public attachLazy(tag: string, pinFactory: () => _PinType): PinMap<_PinType> {
    if (this.locked) return this;
    if (this._proxy != undefined)
      return this._proxy.attachLazy(tag, pinFactory);

    if (this.has(tag)) this.detach(tag);
    this._lazyMap[tag] = pinFactory;
    this._tags.push(tag);
    return this;
  }

  public attach(tag: string, pin: _PinType): PinMap<_PinType> {
    if (this.locked) return this;
    if (this._proxy != undefined)
      return this._proxy.attach(tag, pin);

    if (this.has(tag)) this.detach(tag);

    this._map[tag] = pin;
    this._tags.push(tag);
    return this._emit('attached', {tag, pin}) as PinMap<_PinType>;
  }

  public detach(tag: string): PinMap<_PinType> {
    if (this.locked) return this;
    if (this._proxy != undefined)
      return this._proxy.detach(tag);
    let pin = this._map[tag];

    if (pin) {
      delete this._map[tag];
      this._tags.slice(this._tags.indexOf(tag), 1);
      return this._emit('detached', {tag, pin}) as PinMap<_PinType>;
    } else {
      let pinFactory = this._lazyMap[tag];
      if (pinFactory) {
        delete this._lazyMap[tag];
        this._tags.slice(this._tags.indexOf(tag), 1);
      }
      return this;
    }
  }

  public lock(): PinMap<_PinType> {
    if (!this._locked) {
      this._locked = true;
      this._emit('locked');
    }

    return this;
  }

  public cleanup() {
    super.cleanup();
    this._proxy = undefined;
    Object.values(this._map).forEach(pin => pin.cleanup());
  }

  public has(tag: string): boolean {
    if (this._proxy != undefined)
      return this._proxy.has(tag);
    return tag in this._map || tag in this._lazyMap;
  }
  public get(tag: string): _PinType {
    if (this._proxy != undefined)
      return this._proxy.get(tag);

    if (!this._map[tag]) {
      let pin = this._lazyMap[tag]();
      delete this._lazyMap[tag];
      this._map[tag] = pin;
      this._emit('attached', {tag, pin})
    }
    return this._map[tag];
  }

  public get keys(): string[] {
    if (this._proxy != undefined)
      return this._proxy.keys;
    return this._tags;
  }

  public get tightEntries(): {tag: string, pin: _PinType}[] {
    if (this._proxy != undefined)
      return this._proxy.tightEntries;
    return Object.keys(this._map).map(tag => ({tag, pin: this.get(tag)}));
  }

  public get allEntries(): {tag: string, pin: _PinType}[] {
    if (this._proxy != undefined)
      return this._proxy.allEntries;
    return this._tags.map(tag => ({tag, pin: this.get(tag)}));
  }

  public promiseForEach(cons: (entry: {tag: string, pin: _PinType}) => void) {
    this.tightEntries.forEach(cons);
    this.onAttached.subscribe(cons);
  }

  public proxy(another: PinMap<_PinType>) {
    this._proxy = another;
  }

  public get locked(): boolean { return this._locked; }

  public get onLocked(): Observable<void> { return this.on('locked'); }
  public get onAttached(): Observable<{tag: string, pin: _PinType}> { return this.on('attached'); }
  public get onDetached(): Observable<{tag: string, pin: _PinType}> { return this.on('detached'); }
}
