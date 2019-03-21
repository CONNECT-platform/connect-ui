import { ProxyRenderer, AbstractRenderer } from '../../renderer/renderer';


//
// TODO: write tests for this.
//
export class StyledRenderer extends ProxyRenderer<any> {
  constructor(private contentId: string, renderer: AbstractRenderer<any>) {
    super(renderer, undefined);
  }

  render(tag: string) {
    return this.proxied.render(tag).attr(this.contentId);
  }
}

//
// TODO: write tests for this.
//
export function styleProxy(contentId: string) {
  return function(R: AbstractRenderer<any>) {
    return new StyledRenderer(contentId, R);
  }
}
