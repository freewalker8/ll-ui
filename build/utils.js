const path = require('path');
const glob = require('glob');

function resolve(...dirs) {
  return path.join(__dirname, '../', ...dirs);
}

function normalize(parent, ...dirname) {
  const dir = path.join(parent, ...dirname);
  const reg = /\\/g;

  return reg.test(dir) ? dir.replace(reg, '/') : dir;
}

const componentDirs = '{form,table}';

function getResloveMap(prefix = '', dirname = componentDirs) {
  const resloveMap = {};
  const dirs = glob.sync(`${prefix}/packages/${dirname}/*`);

  dirs.forEach(dir => {
    const val = prefix ? i.replace(prefix, '') : i;
    const key = val.split('/').reverse()[0];
    resloveMap[key] = resolve(val);
  });

  return resloveMap;
}

const componentExternals = {};

function getEntryAndExternals(dirname = componentDirs) {
  const entry = {};
  glob.sync(`packages/${dirname}/**/*.{js,vue}`).map(i => {
    const val = i;
    const key = val.replace('packages/', '').replace(/(\/index)?\.(js|vue)/, '');
    if (!key.endsWith('.umd')) {
      componentExternals[key] = `ll-form-table/${key}`;
      entry[i.replace('packages/', '').replace(/\.(js|vue)/, '')] = `./${val}`;
    }
  });

  entry['index'] = './packages/index.js';
  entry['externals'] = './packages/externals.js';

  return {
    entry,
    componentExternals
  };
}

module.exports = {
  resolve,
  normalize,
  getResloveMap,
  getEntryAndExternals
};
