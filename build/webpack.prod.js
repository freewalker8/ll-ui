const webpack = require('webpack');
const { VueLoaderPlugin } = require('vue-loader');
const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const path = require('path');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const TerserPlugin = require('terser-webpack-plugin');

const TARGET = process.env.TARGET || 'commonjs2';
const isUmd = TARGET === 'umd';

const pkg = require('./package.json');
let reportFilename = resolve('../report.html');
let filename = 'll.common.js';
let entry = resolve('../src/packages/index.js');
let externals = {
  vue: 'Vue',
  axios: {
    commonjs: 'axios',
    commonjs2: 'axios',
    amd: 'axios',
    root: 'Axios'
  },
  'async-validator': 'async-validator',
  'async-validator/es/rule': 'async-validator/es/rule',
  'async-validator/es/util': 'async-validator/es/util',
  'lodash-es': 'lodash-es'
};

if (isUmd) {
  reportFilename = resolve('../report.umd.html');
  filename = 'll.umd.js';
  entry = resolve('../src/packages/index.umd.js');
  externals = {
    vue: 'Vue',
    axios: 'axios'
  };
}

function resolve(dir) {
  return path.join(__dirname, dir);
}

module.exports = {
  mode: 'production',
  entry,
  output: {
    library: 'll-ui',
    libraryTarget: TARGET,
    filename,
    path: resolve('../dist'),
    umdNamedDefines: isUmd
  },
  resolve: {
    extensions: ['.js', '.vue', '.json'],
    modules: ['node_modules'],
    alias: {
      '@': resolve('src'),
      'll-ui': resolve('src'),
      utils: resolve('src/utils')
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
    rules: [
      {
        test: /\.vue$/,
        use: ['vue-loader']
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@vue/babel-preset-jsx'],
            plugins: ['@babel/plugin-syntax-jsx']
          }
        }
      },
      {
        test: /\.scss$/,
        use: ['vue-style-loader', 'css-loader', 'sass-loader']
      },
      {
        test: /\.(svg|otf|ttf|woff2?|eot|git|png|jpe?g)(\?\S*)?$/,
        use: ['url-loader'],
        query: {
          limit: 10000,
          name: path.posix.join('static', '[name].[ext]')
        }
      }
    ]
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
