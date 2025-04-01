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
        _VERSION_: JSON.stringify(pkg.version),
      }),
      new LodashModuleReplacementPlugin({
        paths: true,
      })
    ],
    resolve: {
      alias: {
        '@': resolve('src'),
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
    modules: {
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
    port: '8008',
  }
};
