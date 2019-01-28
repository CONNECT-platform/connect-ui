import { Observable } from 'rxjs';

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

  public get last(): _Type { return this._last; }
  public get onSent(): Observable<_Type> { return this.on('sent'); }
}
