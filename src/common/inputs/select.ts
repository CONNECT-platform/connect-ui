import { BaseInputComponent } from './base';
import component from '../../renderer/decorator';

import { Namer } from '../../util/namer';

import isEqual from 'lodash.isequal';


//
// TODO: write tests for this.
// TODO: fix the bug on rerendering with object data.
//
// TODO: fix the following performance issue:
//    --> evidently it is not an issue of select, but of proxies not being cleaned up.
//
//
@component('select', {
  inputs: ['value', 'options'],
  outputs: ['value'],
})
class SelectComponent extends BaseInputComponent {
  optionmap: {[key: string]: any} = undefined;

  build() {
    super.build();
    this.state('options');
    this.expr('e', ['options'], options => {
      (this.root.native as HTMLElement).innerHTML = "";
      let namer = new Namer();
      this.optionmap = {};

      options.forEach((option: {label: string, value: string}|string) => {
        if (typeof option === 'string')
          option = { label: option, value: option };

        let key = namer.next;
        this.optionmap[key] = option.value;

        this.renderer.render('option').attr('value', key).text(option.label).on(this.root);
      });
    });
  }

  wire() {
    super.wire();
    this.in.get('options').connect(this.children.options.inputs.get('in'));
    this.children.options.outputs.get('out').connect(this.children.e.inputs.get('options'));
  }

  render() {
    this.renderTransient();
  }

  getOptionValue(option: HTMLOptionElement) {
    if (this.optionmap)
      return this.optionmap[option.value];
    return option.value;
  }

  get() {
    let select = this.root.native as HTMLSelectElement;
    if (select.hasAttribute('multiple')) {
      return Array.from(select.options).filter(option => option.selected).map(option => this.getOptionValue(option));
    }
    else
      return select.value;
  }

  set(value: any) {
    let select = this.root.native as HTMLSelectElement;
    if (select.hasAttribute('multiple'))
      Array.from(select.options).forEach(option => {
        let optionValue = this.getOptionValue(option);
        option.selected = value.some((v: any) => isEqual(v, optionValue));
      });
    else {
      Array.from(select.options).forEach(option => option.selected = (isEqual(value, this.getOptionValue(option))));
      select.value = value;
    }
  }
}

export default SelectComponent;
