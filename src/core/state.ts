import { Resource, ResourceLoadCallback } from './resource';


export class State<_Type> extends Resource<_Type> {
  constructor(value?: _Type) {
    super();

    if (value) this.value = value;
  }

  load(callback: ResourceLoadCallback<_Type>) { callback(this.value); }
  update(data: _Type) {}

  protected shouldReload(): boolean { return false; }

  public get value(): _Type { return this.out.last; }
  public set value(value: _Type) { this.in.receive(value); }
}
