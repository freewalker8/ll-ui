/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2025-04-10 11:18:39
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-10 12:32:27
 * @FilePath: \ll-form-table\build\webpack.prod.umd.js
 * @Description: umd 打包配置
 */
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const { externals, resolve, alias, rules } = require('./common');

const pkg = require('../package.json');
const reportFilename = resolve('../report.umd.html');

const { COMP } = process.env;
let libraryName = 'LlFormTable';
let filename = 'll-form-table.umd.js';
let entry = resolve('../src/packages/index.umd.js');

if (COMP === 'form') {
  libraryName = 'LlForm';
  filename = 'll-form.umd.js';
  entry = resolve('../src/packages/form/index.umd.js');
} else if (COMP === 'table') {
  libraryName = 'LlTable';
  filename = 'll-table.umd.js';
  entry = resolve('../src/packages/table/index.umd.js');
}

module.exports = {
  mode: 'production',
  entry,
  output: {
    library: libraryName,
    libraryTarget: 'umd',
    filename,
    path: resolve('../dist/umd')
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
