import path from 'path';
import webpack from 'webpack';

const VirtualModulesPlugin = require('webpack-virtual-modules');

import registry from '../../renderer/component-registry';


export class TestPlugin {
  virtual: any;
  constructor(private entry: string) {
    this.virtual = new VirtualModulesPlugin();
  }

  apply(compiler: webpack.Compiler) {
    this.virtual.apply(compiler);

    compiler.hooks.compilation.tap('TestPlugin', compilation => {
      // console.log('--------- TEST PLUGIN -----------');
      // require(this.entry);
      // console.log(registry);
      // console.log('---------------------------------');
      this.virtual.writeModule('src/__test.ts', 'export const hellow = "world";');
    });
  }
}
