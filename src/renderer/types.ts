export interface RenderingNode<_Node extends RenderingNode<_Node>> {
  text(text: string): _Node;
  attr(attr: string, content: string): _Node;
  attributes(): string[];

  component?: RenderingComponent<_Node>;
}

export interface RenderingRequestType<_Node extends RenderingNode<_Node>> {
  text(content: string): RenderingRequestType<_Node>;
  attr(attr: string, content: string): RenderingRequestType<_Node>;
  on(host: _Node): _Node;
}

export interface RendererType<_Node extends RenderingNode<_Node>> {
  render(tag: string): RenderingRequestType<_Node>;
}

export interface RenderingComponent<_Node extends RenderingNode<_Node>> {
  mount(node: _Node): RenderingComponent<_Node>;
  render(renderer: RendererType<_Node>): RenderingComponent<_Node>;
}
