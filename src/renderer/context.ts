import { RenderingContext } from './types';
import { AbstractComponent } from './component';


//
// TODO: write tests for this.
//
export class Context implements RenderingContext<any> {
  public scope: {[name: string]: any} = {};

  public inherit(parent: {[name: string]: any} | Context) {
    if (parent instanceof Context)
      Object.assign(this.scope, parent.scope);
    else
      Object.assign(this.scope, parent);
    return this;
  }

  //
  // TODO: update tests to include child tree crawling.
  //
  public apply(node: any) {
    this._apply(node);

    if (node.children) {
      if (node.component && node.component.hooks) {
        (node.component.hooktags || []).forEach((tag: string) => {
          node.component.hooks(tag).forEach((hook: any) => {
            hook.children.forEach((child: any) => {
              this.apply(child)
            });
          });
        });
      }
      else {
        node.children.forEach((child: any) => {
          this.apply(child);
        });
      }
    }

    return this;
  }

  private _apply(node: any) {
    node.attributes
      .filter((attribute: string) => attribute.startsWith('context:'))
      .forEach((attribute: string) => {
        let targetDirective = attribute.split(':');
        let valueDirective = node.getAttr(attribute).split('.');

        let apply: (value: any) => void;

        if (targetDirective.length == 2) {
          if (targetDirective[1] == 'text') apply = (value: any) => node.text(value);
          else apply = (value: any) => node.attr(targetDirective[1], value.toString());
        }
        else if (targetDirective.length == 3) {
          if (targetDirective[1] == 'component') {
            if (node.component) {
              if (node.component instanceof AbstractComponent) {
                let comp = node.component as AbstractComponent<any>;
                if (comp.inputs.has(targetDirective[2])) {
                  apply = (value: any) => comp.inputs.get(targetDirective[2]).receive(value);
                }
                else {
                  //
                  // TODO: raise proper error.
                  //
                }
              }
              else {
                //
                // TODO: raise proper error.
                //
              }
            }
            else {
              //
              // TODO: raise proper error.
              //
            }
          }
          else {
            //
            // TODO: raise proper error.
            //
          }
        }

        let value: any = this.scope;
        valueDirective.forEach((step: string) => {
          try {
            value = value[step];
          } catch(_) { value = undefined; }
        });

        if (apply && (value !== undefined)) apply(value);
        else {
          //
          // TODO: raise proper error.
          //
        }
      });

    if (node.component && node.component.context)
      node.component.context(this);
  }
}
