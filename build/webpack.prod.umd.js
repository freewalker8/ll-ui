/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2025-04-10 11:18:39
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-10 12:32:27
 * @FilePath: \ll-ui\build\webpack.prod.umd.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const { externals, resolve, alias, rules } = require('./common');

const pkg = require('../package.json');
const reportFilename = resolve('../report.umd.html');
const filename = 'll.umd.js';
const entry = resolve('../src/packages/index.umd.js');

module.exports = {
  mode: 'production',
  entry,
  output: {
    library: 'll-ui',
    libraryTarget: 'umd',
    filename,
    path: resolve('../dist')
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: ['node_modules'],
    alias
  },
  performance: {
    hints: false
  },
  externals,
  optimization: {
    // minimize: false,
    minimizer: [
      new TerserPlugin({
        cache: true,
        parallel: true
      })
    ]
  },
  module: {
    noParse: [/^lodash$/],
    rules
  },
  plugins: [
    new VueLoaderPlugin(),
    new webpack.DefinePlugin({
      _VERSION_: JSON.stringify(pkg.version)
    }),
    new LodashModuleReplacementPlugin({
      paths: true
    }),
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      reportFilename,
      openAnalyzer: false
    })
  ]
};
