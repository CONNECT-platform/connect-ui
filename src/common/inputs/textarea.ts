import { BaseInputComponent } from './base';
import component from '../../renderer/decorator';


//
// TODO: write tests for this.
//
@component('textarea', {
  inputs: ['value'],
  outputs: ['value'],
})
class TextAreaComponent extends BaseInputComponent {
  get() {
    return (this.root.native as HTMLTextAreaElement).value;
  }

  set(value: any) {
    (this.root.native as HTMLTextAreaElement).value = value;
  }
}

export default TextAreaComponent;
