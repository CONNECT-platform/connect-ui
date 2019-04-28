import { Namer } from '../../util/namer';
import { StyledRenderer } from './renderer';

import { RendererType } from '../../renderer/types';


const _namer = new Namer();

export default function(styleFunc: (contentId: string, rootId: string) => string) {
  return function<_Comp extends {new(...args:any[]): any}>
    (_Class: _Comp) {

    let _style_id = _namer.next;
    let _root_id = '__root_' + _style_id + '__';
    let _content_id = '__content_' + _style_id + '__';

    let _css = styleFunc(_content_id, _root_id);

    if (window) {
      window.addEventListener('load', () => {
        let _style_element = document.createElement('style');
        _style_element.textContent = _css;
        document.body.appendChild(_style_element);
      });
    }

    class _NewComp extends _Class {
      protected adopt(renderer: RendererType<any>) {
        super.adopt(new StyledRenderer(_content_id, renderer));
      }

      render() {
        this.root.attr(_root_id);
        return super.render();
      }
    }

    return _NewComp;
  }
}
