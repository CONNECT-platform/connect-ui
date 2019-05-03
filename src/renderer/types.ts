export interface RenderingNode<_Node extends RenderingNode<_Node>> {
  text(text: string): _Node;
  attr(attr: string, content?: string): _Node;
  trans?(tag: string): _Node;
  transtag?(): string;

  clone(): _Node;
  proxy?(node: _Node): _Node;

  getAttr(attr: string): string;

  component?: RenderingComponent<_Node>;
  children: _Node[];
  proxies?: _Node[];
  attributes: string[];
}

export interface RenderingRequestType<_Node extends RenderingNode<_Node>> {
  text(content: string): RenderingRequestType<_Node>;
  attr(attr: string, content?: string): RenderingRequestType<_Node>;
  on(host: _Node): _Node;
}

export interface RenderingContext<_Node extends RenderingNode<_Node>> {
  scope: {[name: string]: any};
  inherit(parent: {[name: string]: any} | RenderingContext<_Node>): RenderingContext<_Node>;
  apply(node: _Node): RenderingContext<_Node>;
  get(directive: string): any;
}

export interface RendererType<_Node extends RenderingNode<_Node>> {
  render(tag: string): RenderingRequestType<_Node>;
  renderClone(tag: string, node: _Node): RenderingRequestType<_Node>;
  virtualHook(tag: string): RendererType<_Node>;

  within(component: RenderingComponent<_Node>): RendererType<_Node>;
  clone?(node: _Node): _Node;
}

export interface RenderingComponent<_Node extends RenderingNode<_Node>> {
  hook?(tag: string, node: _Node): RenderingComponent<_Node>;
  getHook?(tag: string): _Node;
  hooktags?: string[];

  clone(node?: _Node): RenderingComponent<_Node>;
  proxy?(component: RenderingComponent<_Node>): RenderingComponent<_Node>;

  attach?(): RenderingComponent<_Node>;
  context?(context: RenderingContext<_Node>): RenderingComponent<_Node>;
  renderingContext?(): RenderingContext<_Node>;
}
