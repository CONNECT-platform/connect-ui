import { should, expect } from 'chai'; should();

const compile = require('../compiler');

import postcss from 'postcss';
import parser from 'postcss-selector-parser';


function analyze(css:string) {
  let rules: {rule: postcss.Node, selectors: parser.Node[][]}[] = [];
  let _css = postcss(root => {
    root.walkRules(rule => {
      let record: {rule: postcss.Node, selectors: parser.Node[][]} = {
        rule: rule,
        selectors: []
      };
      rules.push(record);

      rule.selectors.forEach(selector => parser(selector => {
        let nodes: parser.Node[] = [];

        if (!record.selectors) record.selectors = [];
        record.selectors.push(nodes);
        selector.walk(node => {
          nodes.push(node);
        });
      }).processSync(selector));
    });
  }).process(css).css;

  //console.log(_css);

  return rules;
}


describe('compiler', () => {
  it('should return the code of a function that will return some css string.', () => {
    let code = `
      :root .x a[z~=x]:focused:not(.dude a) ~ ::deep b.y:hover {
        color: white !important;
      }
    `;

    expect(typeof eval(compile(code))('a', 'b')).to.equal('string');
  });

  it('should return a function that doesn\'t touch the css declerations.', () => {
    let code = `
      a {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    (rules[0].rule as any).nodes[0].prop.should.equal('color');
    (rules[0].rule as any).nodes[0].value.should.equal('blue');
  });

  it('should add a proper attribute specifier to class tags.', () => {
    let code = `
      .a {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][2].type.should.equal('attribute');
    (rules[0].selectors[0][2] as any)._attribute.should.equal('A');
  });

  it('should add a proper attribute specifier to html tags.', () => {
    let code = `
      a {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][2].type.should.equal('attribute');
    (rules[0].selectors[0][2] as any)._attribute.should.equal('A');
  });

  it('should add a proper attribute specifier to attribute tags.', () => {
    let code = `
      [a] {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][2].type.should.equal('attribute');
    (rules[0].selectors[0][2] as any)._attribute.should.equal('A');
  });

  it('should add a proper attribute specifier to universal tags.', () => {
    let code = `
      * {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][2].type.should.equal('attribute');
    (rules[0].selectors[0][2] as any)._attribute.should.equal('A');
  });

  it('should add a proper attribute specifier to pseudo element tags.', () => {
    let code = `
      ::-webkit-scrollbar {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][1].type.should.equal('attribute');
    (rules[0].selectors[0][1] as any)._attribute.should.equal('A');
  });

  it('should properly apply the attribute to multiple parallel selectors', () => {
    let code = `
      a, .some-class {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][2].type.should.equal('attribute');
    (rules[0].selectors[0][2] as any)._attribute.should.equal('A');
    rules[0].selectors[1][2].type.should.equal('attribute');
    (rules[0].selectors[1][2] as any)._attribute.should.equal('A');
  });

  it('should apply the attribute to all tags in a selector chain.', () => {
    let code = `
      [hellow] ::pseudo > span:hover {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][2].type.should.equal('attribute');
    (rules[0].selectors[0][2] as any)._attribute.should.equal('A');
    rules[0].selectors[0][4].type.should.equal('attribute');
    (rules[0].selectors[0][4] as any)._attribute.should.equal('A');
    rules[0].selectors[0][8].type.should.equal('attribute');
    (rules[0].selectors[0][8] as any)._attribute.should.equal('A');
  });

  it('should apply the attribute to tags of an inner selector.', () => {
    let code = `
      b:not(.hellow) {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][2].type.should.equal('attribute');
    (rules[0].selectors[0][2] as any)._attribute.should.equal('A');
    rules[0].selectors[0][6].type.should.equal('attribute');
    (rules[0].selectors[0][6] as any)._attribute.should.equal('A');
  });

  it('should not apply the attribute to state selectors.', () => {
    let code = `
      b:hover {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][2].type.should.equal('attribute');
    (rules[0].selectors[0][2] as any)._attribute.should.equal('A');
    expect(rules[0].selectors[0][4]).to.be.undefined;
  });

  it('should only apply the attribute to the first tag of a combination.', () => {
    let code = `
      b.some-class {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][2].type.should.equal('attribute');
    (rules[0].selectors[0][2] as any)._attribute.should.equal('A');
    rules[0].selectors[0][3].type.should.equal('class');
    expect(rules[0].selectors[0][4]).to.be.undefined;
  });

  it('should not apply to `@keyframes` rules and sub-rules.', () => {
    let code = `
      @keyframes {
        5% {
          color: blue;
        }
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][1].type.should.equal('tag');
    rules[0].selectors[0][1].value.should.equal('5%');
    rules[0].selectors[0].length.should.equal(2);
  });

  it('should apply properly to media query rules.', () => {
    let code = `
      @media (max-width: 640px) {
        .some-class {
          color: blue;
        }
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][2].type.should.equal('attribute');
    (rules[0].selectors[0][2] as any)._attribute.should.equal('A');
  });

  it('should not apply the attribute after `::deep` pseudo selector.', () => {
    let code = `
      a ::deep b {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][2].type.should.equal('attribute');
    (rules[0].selectors[0][2] as any)._attribute.should.equal('A');
    expect(rules[0].selectors[0][5]).to.be.undefined;
  });

  it('should consider `::deep` pseudo selector separately for each parallel selector.', () => {
    let code = `
      a ::deep b, c d {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][2].type.should.equal('attribute');
    (rules[0].selectors[0][2] as any)._attribute.should.equal('A');
    expect(rules[0].selectors[0][5]).to.be.undefined;
    rules[0].selectors[1][2].type.should.equal('attribute');
    (rules[0].selectors[1][2] as any)._attribute.should.equal('A');
    rules[0].selectors[1][5].type.should.equal('attribute');
    (rules[0].selectors[1][5] as any)._attribute.should.equal('A');
  });

  it('should add the attribute at the beginning of the selector if `::deep` appears as first tag.', () => {
    let code = `
      ::deep a {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][1].type.should.equal('attribute');
    (rules[0].selectors[0][1] as any)._attribute.should.equal('A');
    expect(rules[0].selectors[0][4]).to.be.undefined;
  });

  it('should replace `:root` pseudo selector with proper component root attribute selector.', () => {
    let code = `
      :root a {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][1].type.should.equal('attribute');
    (rules[0].selectors[0][1] as any)._attribute.should.equal('B');
    rules[0].selectors[0].length.should.equal(5);
  });

  it('should ignore `:root` when it appears anywhere but the start of the selector.', () => {
    let code = `
      a :root b {
        color: blue;
      }
    `;

    let rules = analyze(eval(compile(code))('A', 'B'));
    rules[0].selectors[0][1].type.should.equal('tag');
    rules[0].selectors[0][4].type.should.equal('tag');
    rules[0].selectors[0].length.should.equal(6);
  });
});
