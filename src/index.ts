import { InputPin, OutputPin } from './core/base/io';
import './core/composite';


window.addEventListener('load', () => {
  let o = new OutputPin();
  let i = new InputPin();
  i.connect(o);

  i.onReceived.subscribe(data => console.log(data));
  document.querySelector('h1').addEventListener('click', event => o.send(event));
});
