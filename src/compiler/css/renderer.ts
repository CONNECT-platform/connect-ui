import { RendererType, RenderingComponent } from '../../renderer/types';


//
// TODO: write tests for this.
//
export class StyledRenderer implements RendererType<any> {
  constructor(
    private contentId: string,
    private renderer: RendererType<any>) {
  }

  render(tag: string) {
    return this.renderer.render(tag).attr(this.contentId);
  }

  within(component: RenderingComponent<any>) {
    return new StyledRenderer(this.contentId, this.renderer.within(component));
  }

  clone(node: any) {
    return this.renderer.clone(node);
  }
}
