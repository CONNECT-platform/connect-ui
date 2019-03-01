export interface RenderingNode<_Node extends RenderingNode<_Node>> {
  text(text: string): _Node;
  attr(attr: string, content?: string): _Node;
  attributes(): string[];

  clone(): _Node;

  component?: RenderingComponent<_Node>;
  children: _Node[];
}

export interface RenderingRequestType<_Node extends RenderingNode<_Node>> {
  text(content: string): RenderingRequestType<_Node>;
  attr(attr: string, content: string): RenderingRequestType<_Node>;
  on(host: _Node): _Node;
}

export interface RendererType<_Node extends RenderingNode<_Node>> {
  render(tag: string): RenderingRequestType<_Node>;
  within(component: RenderingComponent<_Node>): RendererType<_Node>;
}

export interface RenderingComponent<_Node extends RenderingNode<_Node>> {
  hook?(tag: string, node: _Node): RenderingComponent<_Node>;
  hooks?(tag: string): _Node[];

  clone(node?: _Node): RenderingComponent<_Node>;
}
