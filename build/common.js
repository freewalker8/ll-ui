const path = require('path');

function resolve(dir) {
  return path.join(__dirname, dir);
}

const externals = {
  vue: {
    commonjs: 'vue',
    commonjs2: 'vue',
    amd: 'Vue',
    root: 'Vue'
  },
  'element-ui': {
    root: 'ELEMENT',
    commonjs: 'element-ui',
    commonjs2: 'element-ui',
    amd: 'element-ui'
  },
  axios: {
    commonjs: 'axios',
    commonjs2: 'axios',
    amd: 'axios',
    root: 'axios'
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
  'll-form-table': resolve('../src/packages'),
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
        presets: [
          '@vue/cli-plugin-babel/preset',
          [
            '@vue/babel-preset-jsx',
            {
              injectH: false
            }
          ]
        ],
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
