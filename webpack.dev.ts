import config from './webpack.conf';
const merge = require('webpack-merge');

export default merge(config, {
  mode: 'development'
});
