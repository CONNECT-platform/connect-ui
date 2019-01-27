import $ from 'jquery';
import hellow from './hellow';

$(document).ready(() => {

  let x = hellow();
  x.subscribe((v: string) => {
    console.log(v);
  })
});
