const webpack = require('webpack');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');

module.exports = (env, cnf) => {
  console.log(env.devServer);

  env.devServer.static = {
    directory: "packages/viewer/src/assets",
  };
 
  const config = {
    ...env,
  };
  return config;
};
