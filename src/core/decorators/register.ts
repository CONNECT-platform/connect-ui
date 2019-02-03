import { Node } from '../base/node';
import { Signature } from '../base/signature';
import { NodeRegistry } from '../node-registry';

import registry from '../node-registry';
import signatureDecorator from './signature';

export default function register(path: string, signature?: Signature) {
  const _registerClass = function(registry: NodeRegistry) {
    return function<_ClassType extends {new(...args:any[]):Node}>(_Class: _ClassType) {
      if (signature) _Class = signatureDecorator(signature)(_Class);
      if (!(_Class as any).signature)
        throw new Error(`class ${_Class.name} doesn't have a signature and no signature is provided as well.`);

      registry.register(path, (_Class as any).signature, () => new _Class());
      return _Class;
    }
  }

  const decorator = function<_ClassType extends {new(...args:any[]):Node}>(_Class: _ClassType) {
    return _registerClass(registry)(_Class);
  }

  decorator.on = function(registry: NodeRegistry) {
    return function<_ClassType extends {new(...args:any[]):Node}>(_Class: _ClassType) {
      return _registerClass(registry)(_Class);
    }
  }

  return decorator;
}
