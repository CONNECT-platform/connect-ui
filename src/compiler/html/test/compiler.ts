import { should, expect } from 'chai'; should();

import compile from '../compiler';

describe('compiler', () => {
  it('should work?', () => {
    compile(`
      <@x/>
      <hr/>
      <p $content @y>hellow
        <span class="highlight">world</span>
        !
      </p>
      <@x/>
    `);
  });
});
