import { AbstractComponent } from '../component';
import { HTMLNode } from './node';

import './utils/is-connected-polyfill';


//
// TODO: write tests for this.
//
export class HTMLComponent extends AbstractComponent<HTMLNode> {
  attach(): HTMLComponent {
    let observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.removedNodes.length > 0) {
          if (!this.root.native.isConnected) {
            this.root.cleanup();
            observer.disconnect();
          }
        }
      });
    });

    let target = this.root.native.parentNode;
    while (target) {
      observer.observe(target, { childList: true });
      target = target.parentNode;
    }

    return this;
  }

  clone(_: HTMLNode): HTMLComponent { return this; }
}
