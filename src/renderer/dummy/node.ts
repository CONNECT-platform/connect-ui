import { RenderingNode, RenderingComponent } from '../types';


export class DummyNode implements RenderingNode<DummyNode> {
  public textContent: string = '';
  public attrs: {[attr: string]: string | boolean} = {};
  public children: DummyNode[] = [];
  public component: RenderingComponent<DummyNode>;
  public proxies: DummyNode[] = [];

  private _trans: string;

  constructor(public name: string) {}

  public text(text: string) {
    this.textContent += text;
    return this;
  }

  public attr(attr: string, content?: string) {
    this.attrs[attr] = content || true;
    return this;
  }

  public get attributes() { return Object.keys(this.attrs); }

  public trans(tag: string) {
    this._trans = tag;
    return this;
  }

  public transtag(): string { return this._trans; }

  public proxy(node: DummyNode) {
    this.proxies.push(node);
    return this;
  }

  public clone() {
    let n = new DummyNode(this.name);
    n.textContent = this.textContent;
    n.attrs = Object.assign({}, this.attrs);
    return n;
  }
}
