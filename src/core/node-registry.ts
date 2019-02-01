import { Observable } from 'rxjs/Observable';

import { Topic } from './base/topic';
import { Signature } from './base/signature';
import { Node, NodeInputs, NodeOutputCallback, NodeSignalCallback } from './base/node';


export type NodeRegistryFactory = () => Node;
export type NodeRegistryEntry = {
  signature: Signature,
  factory: NodeRegistryFactory,
};

export class NodeRegistry extends Topic {
  private _entries: {[path: string]: NodeRegistryEntry};
  private _aliases: {[path: string]: string};

  constructor() {
    super();

    this._entries = {};
    this._aliases = {};

    this._def<{ path: string, entry: NodeRegistryEntry}>('registered');
    this._def<{ path: string, original: string }>('aliased');
    this._def<{ path: string, node: Node }>('instantiated');
  }

  public get entries(): { path: string, entry: NodeRegistryEntry }[] {
    return Object.entries(this._entries).map(entry => ({path: entry[0], entry: entry[1]}));
  }

  public get aliases(): { path: string, original: string }[] {
    return Object.entries(this._aliases).map(entry => ({ path: entry[0], original: entry[1]}));
  }

  public resolve(path: string): NodeRegistryEntry {
    if (path in this._aliases) return this.resolve(this._aliases[path]);
    if (path in this._entries) return this._entries[path];
    throw new Error('could not resolve path: ' + path);
  }

  public registered(path: string): boolean {
    try {
      this.resolve(path);
      return true;
    } catch(err) { return false; }
  }

  public signature(path: string): Signature {
    return this.resolve(path).signature;
  }

  public instantiate(path: string): Node {
    let node = this.resolve(path).factory();
    this._emit('instantiated', {path, node});
    return node;
  }

  public register(path: string, signature: Signature, factory: NodeRegistryFactory): NodeRegistry {
    let entry = this._entries[path] = { signature, factory };
    return this._emit('registered', { path, entry }) as NodeRegistry;
  }

  public alias(path: string, original: string): NodeRegistry {
    this._aliases[path] = original;
    return this._emit('aliased', { path, original }) as NodeRegistry;
  }

  public get onRegistered(): Observable<{ path: string, entry: NodeRegistryEntry }> { return this.on('registered'); }
  public get onAliased(): Observable<{ path: string, original: string }> { return this.on('aliased'); }
  public get onInstantiated(): Observable<{ path: string, node: Node }> { return this.on('instantiated'); }
}

const _registry = new NodeRegistry();
export default _registry;

export function register(path: string, signature: Signature, registry: NodeRegistry = _registry) {
  const _createClass = function<_ClassType extends {new(...args:any[]):Node}>(_Class: _ClassType) {
    return class extends _Class {
      protected preBuild() {
        this.signature.inputs = signature.inputs;
        this.signature.outputs = signature.outputs;
        this.signature.signals = signature.signals;

        return super.preBuild();
      }
    }
  }

  const _registerClass = function(registry: NodeRegistry) {
    return function<_ClassType extends {new(...args:any[]):Node}>(_Class: _ClassType) {
      registry.register(path, signature, () => new _Class());
      return _Class;
    }
  }

  const decorator = function<_ClassType extends {new(...args:any[]):Node}>(_Class: _ClassType) {
    return _registerClass(_registry)(_createClass(_Class));
  }

  decorator.on = function(registry: NodeRegistry) {
    return function<_ClassType extends {new(...args:any[]):Node}>(_Class: _ClassType) {
      return _registerClass(registry)(_createClass(_Class));
    }
  }

  return decorator;
}
