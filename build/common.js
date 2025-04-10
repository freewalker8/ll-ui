const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}

const externals = {
  vue: 'Vue',
  axios: {
    commonjs: 'axios',
    commonjs2: 'axios',
    amd: 'axios',
    root: 'Axios'
  },
  'lodash-es': {
    commonjs: 'lodash-es',
    commonjs2: 'lodash-es',
    amd: 'lodash-es',
    root: 'lodash-es'
  },
  sortablejs: {
    commonjs: 'sortablejs',
    commonjs2: 'sortablejs',
    amd: 'Sortable',
    root: 'Sortable'
  }
};

const alias = {
  '@': resolve('../src'),
  'll-ui': resolve('../src/packages'),
  packages: resolve('../src/packages'),
  utils: resolve('../src/utils')
};

const rules = [
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
    use: {
      loader: 'url-loader',
      options: {
        limit: 10000,
        name: path.posix.join('static', '[name].[ext]')
      }
    }
  }
];

module.exports = {
  resolve,
  externals,
  alias,
  rules
};
