import { InputPin, OutputPin } from './core/base/io';
import './core/composite';
import { HTMLNode } from './renderer/html/node';
import { HTMLRenderer } from './renderer/html/renderer';


window.addEventListener('load', () => {
  let root = new HTMLNode(document.body);
  let R = new HTMLRenderer();
  let div = R.render('div').on(root);
  let h = R.render('h1').text('hellow').attr('A', 'B').on(div);

  let _In = new InputPin();

  h.outputs.get('click').connect(_In);
  _In.onReceived.subscribe(console.log);
});
