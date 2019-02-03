import { Signature, extend, extension } from '../base/signature';
import { Agent } from '../base/agent';


export default function(signature: Signature) {
  return function<_ClassType extends {new(...args:any[]):Agent}>(_Class: _ClassType) {
    class _Signed extends _Class {
      protected preBuild() {
        extend(this.signature, signature);
        return super.preBuild();
      }
    }

    let prevsig = (_Class as any).signature || {};
    (_Signed as any).signature = extension(prevsig, signature);
    return _Signed;
  }
}
