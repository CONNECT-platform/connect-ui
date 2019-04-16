import { BaseInputComponent } from './base';
import component from '../../renderer/decorator';


//
// TODO: write tests for this.
//
@component('select', {
  inputs: ['value'],
  outputs: ['value'],
})
class SelectComponent extends BaseInputComponent {
  render() {
    this.renderTransient();
  }

  get() {
    let select = this.root.native as HTMLSelectElement;
    if (select.hasAttribute('multiple')) {
      return Array.from(select.options).filter(option => option.selected).map(option => option.value);
    }
    else
      return select.value;
  }

  set(value: any) {
    let select = this.root.native as HTMLSelectElement;
    if (select.hasAttribute('multiple'))
      Array.from(select.options).forEach(option => option.selected = value.includes(option.value));
    else {
      Array.from(select.options).forEach(option => option.selected = (value == option.value));
      select.value = value;
    }
  }
}

export default SelectComponent;
