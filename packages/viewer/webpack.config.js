var WebpackObfuscator = require('webpack-obfuscator');
module.exports = (config, context) => {
  if (config.resolve) {
    if (config.resolve.fallback) {
      config.resolve.fallback.fs = false;
      config.resolve.fallback.path = false;
      config.resolve.fallback.crypto = false;
      config.resolve.fallback.util = false;
    } else {
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
        util: false,
      };
    }
  } else {
    config.resolve = {
      fallback: {
        fs: false,
        path: false,
        crypto: false,
        util: false,
      },
    };
  }
  
  return config;
};
