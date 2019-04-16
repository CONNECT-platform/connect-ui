import { HTMLComponent } from '../renderer/html/component';
import component from '../renderer/decorator';


//
// TODO: write tests for this.
//
@component('textarea', {
  inputs: ['value'],
  outputs: ['value'],
})
class TextAreaComponent extends HTMLComponent {
  build() {
    this.expr('o', ['event'], () => {
      return (this.root.native as HTMLTextAreaElement).value;
    });

    this.expr('i', ['value'], value => {
      (this.root.native as HTMLTextAreaElement).value = value;
    });
  }

  wire() {
    ['keyup','keypress','keydown','blur','focus','change']
      .forEach(event => {
        this.root.outputs.get(event).connect(this.children.o.inputs.get('event'));
      });

    this.children.o.outputs.get('result').connect(this.out.get('value'));
    this.in.get('value').connect(this.children.i.inputs.get('value'));
    this.in.get('value').connect(this.out.get('value'));
  }
}

export default TextAreaComponent;
