import { HTMLComponent } from '../renderer/html/component';
import component from '../renderer/decorator';

//
// TODO: write tests for this.
//
@component('hidden')
class HiddenComponent extends HTMLComponent {
  render() {
  }
}

export default HiddenComponent;
