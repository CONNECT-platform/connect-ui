import { HTMLComponent } from '../renderer/html/component';
import component from '../renderer/decorator';


//
// TODO: write tests for this.
//
@component('select', {
  inputs: ['value'],
  outputs: ['value'],
})
class SelectComponent extends HTMLComponent {
  render() {
    this.renderTransient();
  }

  build() {
    this.expr('o', ['event'], () => {
      let select = this.root.native as HTMLSelectElement;
      if (select.hasAttribute('multiple')) {
        return Array.from(select.options).filter(option => option.selected).map(option => option.value);
      }
      else
        return select.value;
    });

    this.expr('i', ['value'], value => {
      let select = this.root.native as HTMLSelectElement;
      if (select.hasAttribute('multiple'))
        Array.from(select.options).forEach(option => option.selected = value.includes(option.value));
      else
        select.value = value;
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

export default SelectComponent;
