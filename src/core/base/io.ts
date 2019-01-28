import { Observable } from 'rxjs/Observable';

import { Pin } from './pin';


export class InputPin<_Type> extends Pin {
  private _last: _Type;

  constructor() {
    super();
    this._def<_Type>('received');
    this.onConnected.subscribe(pin => {
      let op = (pin as OutputPin<_Type>);
      let cs = op.onSent.subscribe(data => {
        this.receive(data);
      });

      let ds = op.onDisconnected.subscribe(pin => {
        if (pin == this) {
          cs.unsubscribe();
          ds.unsubscribe();
        }
      });
    });
  }

  receive(data: _Type): InputPin<_Type> {
    this._last = data;
    this._emit('received', data);
    return this.activate() as InputPin<_Type>;
  }

  compatible(pin: Pin) {
    return pin instanceof OutputPin;
  }

  public reset(): InputPin<_Type> {
    this._last = undefined;
    return super.reset() as InputPin<_Type>;
  }

  public get last(): _Type { return this._last; }
  public get onReceived(): Observable<_Type> { return this.on('received'); }
}

export class OutputPin<_Type> extends Pin {
  private _last: _Type;

  constructor() {
    super();
    this._def<_Type>('sent');
  }

  send(data: _Type): OutputPin<_Type> {
    this._last = data;
    this._emit('sent', data);
    return this.activate() as OutputPin<_Type>;
  }

  compatible(pin: Pin) {
    return pin instanceof InputPin;
  }

  public reset(): OutputPin<_Type> {
    this._last = undefined;
    return super.reset() as OutputPin<_Type>;
  }

  public get last(): _Type { return this._last; }
  public get onSent(): Observable<_Type> { return this.on('sent'); }
}

export class PersistentOutput<_Type> extends OutputPin<_Type> {
  constructor() {
    super();

    let cs = this.onConnected.subscribe((pin: InputPin<_Type>) => {
      if (this.activated)
        pin.receive(this.last);

      let rs = pin.onReset.subscribe(() => {
        if (this.activated)
          pin.receive(this.last);
      });

      let ds = pin.onDisconnected.subscribe(pin => {
        if (pin == this) {
          cs.unsubscribe();
          rs.unsubscribe();
          ds.unsubscribe();
        }
      });
    });
  }
}
