var WebpackObfuscator = require('webpack-obfuscator');

module.exports = (config, context) => {
  delete config.output.filename;
  config.output.filename = 'index.js';
  config.plugins.push(
    new WebpackObfuscator(
      { rotateStringArray: true, reservedStrings: ['s*'] },
      []
    )
  );
  config.module.rules.push({
    enforce: 'post',
    use: {
      loader: WebpackObfuscator.loader,
      options: {
        reservedStrings: ['s*'],
        rotateStringArray: true,
      },
    },
  });
  config.entry.index = [context.options.root + '/packages/server/src/main.ts'];
  return config;
};
