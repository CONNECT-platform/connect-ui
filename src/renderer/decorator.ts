import { Signature } from '../core/base/signature';

import { AbstractComponent } from './component';
import { AbstractNode } from './node';
import { RendererType } from './types';
import registry from './component-registry';


//
// TODO: write tests for this.
//
export default function(tagname: string, signature: Signature = {}) {
  return function<_Node extends AbstractNode<_Node>,
              _CompType extends {new(...args:any[]):AbstractComponent<_Node>}>(Comp: _CompType) {

    class _FinalComp extends Comp {
      constructor(...args:any[]) {
        super(signature, args[0], args[1]);
      }

      clone(node: _Node): _FinalComp {
        return new _FinalComp(this.renderer, node);
      }
    }

    registry.register(tagname, (renderer:RendererType<_Node>, node:_Node) => new _FinalComp(renderer, node));
    return _FinalComp;
  }
}
