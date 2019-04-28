import { HTMLNode } from './renderer/html/node';
import { HTMLRenderer } from './renderer/html/renderer';

import { HTMLComponent } from './renderer/html/component';
import component from './renderer/decorator';
import render from './compiler/html/decorator';
import style from './compiler/css/decorator';

import './common/inputs/input';
import './common/inputs/select';
import './common/inputs/textarea';
import './common/conditional';
import './common/list';


@component('a')
@render(require('./test/templates/a.component.html'))
@style(require('./test/styles/a.component.css'))
class A extends HTMLComponent {
}


@component('b')
@style(require('./test/styles/b.component.css'))
@render(require('./test/templates/b.component.html'))
class B extends HTMLComponent {
}


@component('d', { outputs: ['clicked'] })
@render(require('./test/templates/d.component.html'))
class D extends HTMLComponent {
  build() {
    this.state('s');
    this.state('show', true);
    this.expr('e', ['event', 's'], (event, s) => {
      return s.filter((i: any) => i.name != event.currentTarget.dataset.value);
    });
  }

  wire() {
    (this.$.s.component as HTMLComponent).inputs.get('options').receive([
      {label: 'jack', value: {name: 'the jack', age: 22}},
      {label: 'jill', value: {name: 'die jill', age: 43}}
    ]);
    (this.$.s.component as HTMLComponent).outputs.get('value').connect(this.children.s.inputs.get('in'));
    this.children.s.outputs.get('out').connect((this.$.s.component as HTMLComponent).inputs.get('value'));
    this.children.s.outputs.get('out').connect(this.children.e.inputs.get('s'));
    this.children.e.outputs.get('result').connect(this.children.s.inputs.get('in'));

    (this.$.t.component as HTMLComponent).outputs.get('value').connect(this.$.yo.inputs.get('text'));

    this.children.s.outputs.get('out')
      .connect((this.$.valuelist.component as HTMLComponent).inputs.get('items'));
    this.$.listitem.outputs.get('click').connect(this.children.e.inputs.get('event'));

    (this.$.rows.component as HTMLComponent).inputs.get('items').receive([['a', 'b'], ['c', 'd']]);

    this.children.show.outputs.get('out').connect((this.$.showvalue.component as HTMLComponent).inputs.get('value'));
    (this.$.showvalue.component as HTMLComponent).outputs.get('value').connect(this.children.show.inputs.get('in'));

    this.children.show.outputs.get('out')
      .connect((this.$.vlistcond.component as HTMLComponent).inputs.get('condition'));
  }
}


try {
  window.addEventListener('load', () => {
    let root = new HTMLNode(document.body);
    let R = new HTMLRenderer();
    let d = R.render('d').on(root);
    (d.component as D).outputs.get('clicked').onSent.subscribe(console.log);
  });
} catch(err) {}
