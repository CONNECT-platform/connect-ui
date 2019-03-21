import { should, expect } from 'chai'; should();

const compile = require('../compiler');


//
// TODO: write proper tests.
// TODO: research further corner cases and add them to these tests.
//

describe('compiler', () => {
  it('should work?', () => {
    let code = compile(`
      :root .x a[z~=x]:focused:not(.dude a) ~ ::deep b.y:hover {
        color: white !important;
      }
    `);

    console.log(eval(code)('__component__', '__root__'));
  });
});
