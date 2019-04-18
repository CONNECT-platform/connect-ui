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
  }

  wire() {
    this.children.s.outputs.get('out').connect(this.$.st.inputs.get('text'));

    (this.$.s.component as HTMLComponent).outputs.get('value').connect(this.children.s.inputs.get('in'));
    this.children.s.outputs.get('out').connect((this.$.s.component as HTMLComponent).inputs.get('value'));

    this.children.show.outputs.get('out').connect((this.$.showvalue.component as HTMLComponent).inputs.get('value'));
    (this.$.showvalue.component as HTMLComponent).outputs.get('value').connect(this.children.show.inputs.get('in'));

    this.children.show.outputs.get('out')
      .connect((this.$.value.component as HTMLComponent).inputs.get('switch'));
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
