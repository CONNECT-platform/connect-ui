import $ from 'jquery';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs';

export default (): Observable<string> => {
  let e = new Subject<string>();
  $('h1').html('Hellow World!')
    .click(() => {
      e.next('hellow');
    });

  return e;
}
