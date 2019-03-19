const postcss = require('postcss');
const parser = require('postcss-selector-parser');


const processor = parser(selector => {
  const _placeholder = parser.attribute({attribute: '_$$_'});
  selector.walk(node => {
    if (node.type == 'class' || node.type == 'tag' || node.type == 'attribute') {
      let prev = node.prev();
      if (!prev || prev && prev.type == 'combinator')
        node.parent.insertAfter(node, _placeholder);
    }

    //
    // TODO: add an override for global-ish styles.
    //
  });
});

module.exports = function(css) {
  let css = postcss(root => {
    root.walkRules(rule => {
      if (rule.parent && rule.parent.name === 'keyframes')
        return;

      rule.selectors = rule.selectors.map(selector => processor.processSync(selector));
    });
  }).process(css, {from: undefined}).css;

  let code = `(function(scope){`;
  code += `var css='${css.replace(/'/g, "\'").replace(/[\n\r]/g, `' + '\\n' + '`)}';`;
  code += `return css.replace(/\\[_\\$\\$_\\]/g, '[' + scope + ']')`;
  code += `})`;
  return code;
}
