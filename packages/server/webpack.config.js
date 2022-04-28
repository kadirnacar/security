var WebpackObfuscator = require('webpack-obfuscator');

module.exports = (config, context) => {
  delete config.output.filename;
  config.output.filename = 'index.js';
  config.entry.index = [context.options.root + '/packages/server/src/main.ts'];
  return config;
};
