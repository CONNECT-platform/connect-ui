const compile = require('./compiler');

//
// TODO: write tests for this.
//
module.exports = function(content) {
  this.cacheable && this.cacheable();
  return 'module.exports=' + compile(content);
}
