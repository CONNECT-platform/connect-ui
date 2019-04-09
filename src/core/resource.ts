import { Observable } from 'rxjs/Observable';

import { Agent } from './base/agent';
import { InputPin, PersistentOutput } from './base/io';


export type ResourceLoadCallback<_Type> = (data: _Type) => void;

export abstract class Resource<_Type> extends Agent {
  constructor() {
    super({inputs: ['in'], outputs: ['out']});
  }

  protected preBuild() {
    this._def<void>('load');
    this._def<_Type>('loaded');
    this._def<_Type>('update');
  }

  protected bind() {
    //
    // TODO: explore the possibility of adding the same callback to '.onConnected' event
    //       of the output pin, so the resource is loaded seamlessly, if necessary, when
    //       someone connects to it.
    //
    this.control.onActivated.subscribe(() => {
      if (!this.out.activated || this.shouldReload()) {
        this._emit('load');
        this.load((data: _Type) => {
          this._emit('loaded', data);
          this.out.send(data);
        });
      }
    });

    this.in.onReceived.subscribe((data: _Type) => {
      this._emit('update', data);
      this.update(data);
      if (data != this.out.last)
        this.out.send(data);
    });
  }

  protected shouldReload(): boolean { return true; }

  protected abstract load(callback: ResourceLoadCallback<_Type>): void;
  protected abstract update(data: _Type): void;

  public get in(): InputPin<_Type> { return this.inputs.get('in'); }
  public get out(): PersistentOutput<_Type> { return this.outputs.get('out'); }

  public get onLoad(): Observable<void> { return this.on('load'); }
  public get onLoaded(): Observable<_Type> { return this.on('loaded'); }
  public get onUpdate(): Observable<_Type> { return this.on('update'); }

  protected createOutput(_: string): PersistentOutput<_Type> { return new PersistentOutput<_Type>(); }
}
