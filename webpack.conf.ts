import path from 'path';
import webpack from 'webpack';

import { TestPlugin } from './src/compiler/plugins/test.plugin';


const config: webpack.Configuration = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      }
    ]
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  plugins: [
    new TestPlugin(path.join(__dirname, './src')),
  ],
  output: {
    filename: 'connect.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  }
}

export default config;
