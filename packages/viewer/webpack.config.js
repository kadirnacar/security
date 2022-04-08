module.exports = (config, context) => {
  console.log(config);
  if (config.resolve) {
    if (config.resolve.fallback) {
      config.resolve.fallback.fs = false;
      config.resolve.fallback.path = false;
      config.resolve.fallback.crypto = false;
    } else {
      config.resolve.fallback = {
        fs: false,
        path: false,
        crypto: false,
      };
    }
  } else {
    config.resolve = {
      fallback: {
        fs: false,
        path: false,
        crypto: false,
      },
    };
  }
  return config;
};
