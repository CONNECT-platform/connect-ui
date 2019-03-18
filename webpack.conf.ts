import path from 'path';
import webpack from 'webpack';


const config: webpack.Configuration = {
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/
      },
      {
        test: /\.component\.html$/,
        use: 'compiler/html/loader',
        exclude: /node_modules/
      }
    ],
  },
  resolve: {
    extensions: [ '.tsx', '.ts', '.js' ]
  },
  resolveLoader: {
    modules: [
      'node_modules',
      path.resolve(__dirname, 'src')
    ]
  },
  output: {
    filename: 'connect.bundle.js',
    path: path.resolve(__dirname, 'dist'),
  }
}

export default config;
