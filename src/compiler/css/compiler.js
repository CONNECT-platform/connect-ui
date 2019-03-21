const postcss = require('postcss');
const parser = require('postcss-selector-parser');


const is_deep = (node) => {
  if (node.parent && node.parent.__deep) return true;
  if (node.parent.parent) return is_deep(node.parent);
  return false;
}

const processor = parser(selector => {
  const _placeholder = parser.attribute({attribute: '_$$_'});
  const _rootPlaceholder = parser.attribute({attribute: '_$$$_'});

  selector.walk(node => {
    if (node.type == 'pseudo' && node.value == '::deep') {
      node.parent.__deep = true;
      if (!node.prev()) {
        node.replaceWith(_placeholder);
      }
      else
        node.remove();
    }
    else if (node.type == 'pseudo' && node.value == ':root') {
      if (!node.prev()) {
        node.replaceWith(_rootPlaceholder);
      }
      else
        node.remove();
    }
    else {
      if (node.type == 'class' ||
          node.type == 'tag' ||
          node.type == 'attribute' ||
          node.type == 'universal' ||
          node.type == 'pseudo') {
        let prev = node.prev();
        if (!is_deep(node) && (!prev || (prev && prev.type == 'combinator'))) {
          if (node.type == 'pseudo')
            node.parent.insertBefore(node, _placeholder);
          else
            node.parent.insertAfter(node, _placeholder);
        }
      }
    }
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

  return `(
function(scope,root){
    var css='${css.replace(/'/g, "\'").replace(/[\n\r]/g, `' + '\\n' + '`)}';
    css = css.replace(/\\[_\\$\\$_\\]/g, '[' + scope + ']');
    if (root)
      css = css.replace(/\\[_\\$\\$\\$_\\]/g, '[' + root + ']');
    return css;
});`;
}
