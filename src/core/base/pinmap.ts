import { Observable } from 'rxjs/Observable';

import { Topic } from './topic';
import { Pin } from './pin';


export class PinMap<_PinType extends Pin> extends Topic {
  private _map: { [tag: string]: _PinType } = {};
  private _tags: string[] = [];
  private _locked: boolean = false;

  constructor() {
    super();

    this._def<void>('locked');
    this._def<{tag: string, pin: _PinType}>('attached');
    this._def<{tag: string, pin: _PinType}>('detached');
  }

  public attach(tag: string, pin: _PinType): PinMap<_PinType> {
    if (this.locked) return this;
    if (this.has(tag)) this.detach(tag);

    this._map[tag] = pin;
    this._tags.push(tag);
    return this._emit('attached', {tag, pin}) as PinMap<_PinType>;
  }

  public detach(tag: string): PinMap<_PinType> {
    if (this.locked) return this;
    let pin = this._map[tag];

    if (pin) {
      delete this._map[tag];
      this._tags.slice(this._tags.indexOf(tag), 1);
      return this._emit('detached', {tag, pin}) as PinMap<_PinType>;
    }
    else return this;
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
    Object.values(this._map).forEach(pin => pin.cleanup());
  }

  public has(tag: string): boolean { return tag in this._map; }
  public get(tag: string): _PinType { return this._map[tag]; }
  public get entries(): {tag: string, pin: _PinType}[] {
    return this._tags.map(tag => ({tag, pin: this._map[tag]}));
  }

  public get locked(): boolean { return this._locked; }

  public get onLocked(): Observable<void> { return this.on('locked'); }
  public get onAttached(): Observable<{tag: string, pin: _PinType}> { return this.on('attached'); }
  public get onDetached(): Observable<{tag: string, pin: _PinType}> { return this.on('detached'); }
}
