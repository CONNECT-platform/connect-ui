import { Observable } from 'rxjs/Observable';

import { Topic } from './topic';


export class IncompatiblePin extends Error {
  constructor(a: Pin, b: Pin) {
    super(`cannot connect ${a} to ${b}`);
  }
}

export abstract class Pin extends Topic {
  private _connections: Pin[] = [];
  private _activated: boolean = false;

  constructor() {
    super();
    this._def<void>('activated');
    this._def<Pin>('connected');
    this._def<Pin>('disconnected');
    this._def<void>('reset');
  }

  public activate(): Pin {
    this._activated = true;
    return this._emit('activated') as Pin;
  }

  public reset(): Pin {
    if (this.activated) {
      this._activated = false;
      return this._emit('reset') as Pin;
    }
    return this;
  }

  public connected(pin: Pin): boolean {
    return this.connections.includes(pin);
  }

  public connect(pin: Pin): Pin {
    if (this.compatible(pin)) {
      if (!this.connected(pin)) {
        this.connections.push(pin);
        pin.connect(this);

        return this._emit('connected', pin) as Pin;
      }
      else return this;
    }
    else throw new IncompatiblePin(this, pin);
  }

  public disconnect(pin: Pin): Pin {
    if (this.connected(pin)) {
      this.connections.splice(this.connections.indexOf(pin), 1);
      pin.disconnect(this);

      return this._emit('disconnected', pin) as Pin;
    }

    return this;
  }

  public cleanup() {
    super.cleanup();
    [].concat(this._connections).forEach(pin => this.disconnect(pin));
  }

  protected abstract compatible(other: Pin): boolean;

  public get connections(): Pin[] { return this._connections; }
  public get activated(): boolean { return this._activated; }

  public get onActivated(): Observable<void> { return this.on('activated'); }
  public get onReset(): Observable<void> { return this.on('reset'); }
  public get onConnected(): Observable<Pin> { return this.on('connected'); }
  public get onDisconnected(): Observable<Pin> { return this.on('disconnected'); }
}
