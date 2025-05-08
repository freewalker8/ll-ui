/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2025-04-10 09:02:36
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-10 12:30:35
 * @FilePath: \ll-form-table\build\webpack.prod.js
 * @Description: commonjs打包配置
 */
const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');

const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const { externals: commonExternals, resolve, alias, rules } = require('./common');

const pkg = require('../package.json');
const reportFilename = resolve('../report.html');
const { COMP } = process.env;
// console.log('COMP', COMP);
let libraryName = 'll-form-table';
let filename = 'll-form-table.js';
let entry = resolve('../src/packages/index.js');

if (COMP === 'form') {
  libraryName = 'll-form';
  filename = 'form.js';
  entry = resolve('../src/packages/form/index.js');
} else if (COMP === 'table') {
  libraryName = 'll-table';
  filename = 'table.js';
  entry = resolve('../src/packages/table/index.js');
}

const externals = {
  ...commonExternals,
  'async-validator': 'async-validator',
  'async-validator/es/rule': 'async-validator/es/rule',
  'async-validator/es/util': 'async-validator/es/util'
};

module.exports = {
  mode: 'production',
  entry,
  output: {
    library: libraryName,
    libraryTarget: 'commonjs2',
    filename,
    path: resolve('../dist')
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: ['node_modules'],
    alias: {
      ...alias,
      'll-form-table/form': resolve('../src/packages/form'),
      'll-form-table/table': resolve('../src/packages/table')
    }
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
