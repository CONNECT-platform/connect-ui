import { Pin } from './pin';


export class ControllerPin extends Pin {
  compatible(pin: Pin) { return pin instanceof ControlPin; }
}

export class ControlPin extends Pin {
  constructor() {
    super();
    this.onConnected.subscribe(pin => {
      let cs = pin.onActivated.subscribe(() => {
        this.activate();
      });

      let ds = pin.onDisconnected.subscribe(pin => {
        if (pin == this) {
          cs.unsubscribe();
          ds.unsubscribe();
        }
      });
    });
  }

  compatible(pin: Pin) { return pin instanceof ControllerPin; }
}

export class AllGate extends ControlPin {
  activate(): Pin {
    if (this.connections.every(pin => pin.activated))
      return super.activate();
    else return this;
  }
}

export class PersistentGate extends ControllerPin {
  constructor() {
    super();

    this.onConnected.subscribe(pin => {
      if (this.activated) pin.activate();
    });
  }

  reset(): Pin {
    return this;
  }

  deactivate(): PersistentGate {
    super.reset();
    return this;
  }
}
