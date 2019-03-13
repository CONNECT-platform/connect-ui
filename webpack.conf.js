const path = require('path');

const TestPlugin = require('./src/compile/plugin/test.plugin');


module.exports = {
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
    new TestPlugin(__dirname),
  ],
  output: {
    filename: 'connect.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  }
}
