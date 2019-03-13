const path = require('path');
const VirtualModulesPlugin = require('webpack-virtual-modules');


class TestPlugin {
  constructor(root) {
    this.virtual = new VirtualModulesPlugin();
    this.root = root;
  }

  apply(compiler) {
    this.virtual.apply(compiler);

    compiler.hooks.compilation.tap('TestWebPackPlugin', compilation => {
      this.virtual.writeModule('src/__test.ts', 'export const hellow = "world";');
    });
  }
}

module.exports = TestPlugin;
