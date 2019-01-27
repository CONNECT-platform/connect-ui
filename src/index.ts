import $ from 'jquery';
import hellow from './hellow';

$(document).ready(() => {
  let s = hellow().subscribe((v: string) => {
    console.log(v);
  });
  setTimeout(() => {
    console.log('UNSUB');
    s.unsubscribe()
  }, 2000);
});
