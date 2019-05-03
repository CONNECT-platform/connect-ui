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
    this.state('grid', [['a', 'b'], ['c', 'd'], ['e', 'f']]);
    this.state('empty', 'not showing values ...')
  }

  wire() {
    (this.$.s.component as HTMLComponent).inputs.get('options').receive([
      {label: 'jack', value: {name: 'the jack', age: 22}},
      {label: 'jill', value: {name: 'die jill', age: 43}}
    ]);

    this.children.s.outputs.get('out').connect(this.children.e.inputs.get('s'));
    this.children.e.outputs.get('result').connect(this.children.s.inputs.get('in'));

    this.$.listitem.outputs.get('click').connect(this.children.e.inputs.get('event'));
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
