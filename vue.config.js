/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2022-02-17 10:22:05
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-03 11:25:07
 * @FilePath: \ll-ui\vue.config.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
const webpack = require('webpack');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const pkg = require('./package.json');

const isProd = process.env.NODE_ENV === 'production';

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  css: { extract: false },
  configureWebpack: {
    entry: resolve('./examples/main.js'),
    plugins: [
      new webpack.DefinePlugin({
        _VERSION_: JSON.stringify(pkg.version)
      }),
      new LodashModuleReplacementPlugin({
        paths: true
      })
    ],
    resolve: {
      alias: {
        '@': resolve('src'),
        'll-ui': resolve('src'),
        packages: resolve('src/packages'),
        utils: resolve('src/utils')
      }
    },
    externals: isProd
      ? [
          {
            axios: {
              commonjs: 'axios',
              commonjs2: 'axios',
              amd: 'axios',
              root: 'Axios'
            }
          }
        ]
      : [],
    module: {
      noParse: [/^lodash$/],
      rules: [
        {
          test: /\.js$/,
          loader: 'babel-loader',
          include: [resolve('examples'), resolve('src')]
        }
      ]
    }
  },
  chainWebpack: config => {
    if (isProd) {
      config
        .plugin('webpack-bundle-anlyzer')
        .use(BundleAnalyzerPlugin)
        .tap(args => [
          ...args,
          {
            analyzerMode: 'static',
            reportFilename: resolve('./report.html'),
            openAnalyzer: false
          }
        ])
        .end();
    }

    return config;
  },
  devServer: {
    port: '8008'
  }
};
