import { RenderingNode, RenderingComponent } from '../types';


export class DummyNode implements RenderingNode<DummyNode> {
  public textContent: string = '';
  public attrs: {[attr: string]: string | boolean} = {};
  public children: DummyNode[] = [];
  public component: RenderingComponent<DummyNode>;

  constructor(public name: string) {}

  public text(text: string) {
    this.textContent += text;
    return this;
  }

  public attr(attr: string, content?: string) {
    this.attrs[attr] = content || true;
    return this;
  }

  public attributes() { return Object.keys(this.attrs); }

  public clone() {
    let n = new DummyNode(this.name);
    n.textContent = this.textContent;
    n.attrs = Object.assign({}, this.attrs);
    return n;
  }
}
