import { BaseInputComponent } from './base';
import component from '../../renderer/decorator';


//
// TODO: write tests for this.
// TODO: handle initial values from html.
//
@component('input', {
  inputs: ['value'],
  outputs: ['value'],
})
class InputComponent extends BaseInputComponent {
  set(value: any) {
    let input = this.root.native as HTMLInputElement;
    let type = input.getAttribute('type');
    if (type === 'checkbox' || type === 'radio') {
      input.checked = value;
    }
    else
      input.value = value;
  }

  get() {
    let input = this.root.native as HTMLInputElement;
    let type = input.getAttribute('type');
    if (type === 'checkbox' || type === 'radio') {
      return input.checked;
    }
    else return input.value;
  }
}

export default InputComponent;
