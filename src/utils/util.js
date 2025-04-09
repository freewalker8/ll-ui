import secRandom from './secRandom';

/**
 * 获取变量类型
 * @param {any} obj 
 * @returns {String} 变量类型
 */
export const getType = function(obj) {
  return Object.prototype.toString.call(obj).slice(8, -1);
}

/**
 * 判断变量是否为指定的类型
 * @param {any} obj 待判断对象
 * @param {String} type 类型
 * @return {Boolean}
 */
export const isTypeOf = (obj, type) => type.toLowerCase() === getType(obj).toLowerCase();

export const isFunction = function(val) {
  return Object.prototype.toString.call(val) === '[object Function]';
};

export const isObject = function(val) {
  return Object.prototype.toString.call(val) === '[object Object]';
};

export const isArray = function(val) {
  return Array.isArray ? Array.isArray(val) : Object.prototype.toString.call(val) === '[object Array]';
};

export const isBoolean = function(val) {
  return Object.prototype.toString.call(val) === '[object Boolean]';
};

/**
 * 深度判断两个变量是否相等,支持Array|Object|Number|String|Boolean
 * @param {Array|Object|Number|String|Boolean} a 判断因子a
 * @param {Array|Object|Number|String|Boolean} b 判断因子b
 */
export const isValueEqual = function(a, b) {
  if (isArray(a) && isArray(b)) {
    for (let idx = 0, len = a.length; idx < len; idx++) {
      if (!isValueEqual(a[idx], b[idx])) {
        return false;
      }
    }
    return true;
  }

  if (isObject(a) && isObject(b)) {
    return Object.keys(a).every(key => {
      return isValueEqual(a[key], b[key]);
    });
  }

  return a === b;
};

/**
 * 判断两个数组是否由相同的项组成（忽略顺序）
 * @param {Array<String|Number>} srcArr 比较数组1
 * @param {Array<String|Number>} tagArr 比较数组2
 * @returns {Boolean}
 */
export const isUniqueArrayItemEqual = (srcArr, tagArr) => {
  if (srcArr.length !== tagArr.length) return false;

  return srcArr.every(item => tagArr.includes(item));
}

/**
 * 判断一个值是否是有意义的，即不是undefined和null
 * @param {any} val 待判断的值
 * @returns {Boolean}
 */
export const isValidVal = val => {
  return val !== undefined && val !== null;
}

/**
 * 检查对象是否拥有特定的键
 * 
 * @param {Object} obj - 要检查的对象
 * @param {string} key - 要检查的键名
 * @returns {boolean} - 如果对象拥有该键，则返回true；否则返回false
 */
export function hasOwn(obj, key) {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

/**
 * 睡眠
 * @param {Number} delay 睡眠时间，单位ms
 * @returns {Promise}
 */
export const sleep = delay => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve();
    })
  }, delay);
};

/**
 * 将字符串转换为驼峰写法
 * @param {String} str 字符串
 * @returns {String} camelCase
 */
export const strToCamelCase = str => {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }

  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (match, chr) => chr.toUpperCase());
};

/**
 * 将对象的属性转换为驼峰写法
 * @param {Object} obj 对象
 * @param {Boolean} replace 是否是替换模式，默认值：false，为true时表示将原有属性转换为驼峰写法后删除原属性，反之保留原属性和新增的驼峰写法的属性
 * @returns {Object} camelCase
 */
export const objPropToCamelCase = (obj, replace = false) => {
  if (!isObject(obj)) {
    throw new TypeError('Expected an object');
  }

  const result = replace ? obj : { ...obj };

  for (const key in obj) {
    if (hasOwn(obj, key)) {
      const camelCaseKey = strToCamelCase(key);
      if (camelCaseKey !== key) {
        result[camelCaseKey] = obj[key];
        // 替换模式，删除原来的属性
        if (replace) {
          delete result[key];
        }
      }
    }
  }

  return result;
}

/**
 * 获取对象的属性值
 * @param {Object} obj 数据对象
 * @param {String | Array | Function} path 属性路径，为数组时支持级联检索，eg: propVal = getObjectPropVal({ a: { b: 1 } }, path = ['a', 'b']) = 1
 * @returns {any} 属性值
 */
export const getObjectPropVal = (obj, path) => {
  if (isTypeOf(path, 'string')) {
    return obj[path];
  } else if (isTypeOf(path, 'array')) {
    let current = obj;
    for (let i = 0, len = path.length; i < len; i++) {
      current = current[path[i]];
    }
    return current;
  } else if (isTypeOf(path, 'function')) {
    return path.call(null, obj);
  }
};

/**
* 根据属性名称和属性值查找对象数组里面对应的对象并返回
* @param {Array<Object>} data 对象数组，搜索源
* @param {String | Array | Function} key 属性名称
* @param {String | Number} val 属性值
* @param {String | Array} childrenkey 可选参数对象的子节点厉性名称
* @param {Boolean} deepSearch 是否进行深度搜索，即搜索子节点
* @returns {Object<(item, idx: index, index>} 返回搜索结果
*/
 export const getObjArrayItemByKeyValue = (data, key, val, childrenKey ='children', deepSearch = true) => {
  let result = '';
  const childrenKeyArr = Array.isArray(childrenKey) ? childrenKey : [childrenKey];
  for ( const idx in data ) {
    const item = data[idx];
    if (result) return result;
    const searchVal = getObjectPropVal(item, key);
    if (searchVal && searchVal.toString() === val.toString()) {
      const index = parseInt(idx);
      result ={
        item,
        idx: index,
        index 
      };

      return result ;
    } else if (deepSearch) {
      for ( const chdKey of childrenKeyArr ){
        if ( item[chdKey]) {
          result = getObjArrayItemByKeyValue(item[chdKey], key, val, childrenKeyArr, deepSearch);
        }
      }
    }
  }
  return result;
};

/**
 * 展平表单配置项
 * @param {Array<Object} arr 待展平的对象数组
 * @param {String} childrenKey  数组元素的孩子节点的key值
 * @param {Array<Object} flatenedArr? 可选参数，展平后的数组 
 * @returns {Array<Object} 展平后的数组
 */
export const flattenFormItems = (arr, childrenKey = 'children', flatenedArr = []) => {
  const _flattenedArr = flatenedArr;
  arr.forEach(item => {
    if (isObject(item)) {
      const childArr = item[childrenKey];
      Array.isArray(childArr) && flattenFormItems(childArr, childrenKey, _flattenedArr);
    }
    _flattenedArr.push(item);
  })

  return _flattenedArr;
};

/**
 * 根据属性路径设置对象的属性值
 * @param {Object} obj 检索对象
 * @param {String} path 检索路径，多层路径用'.'分割，如：a.b 
 * @param {any} val 值
 * @param {Object} $set vue的全局方法Vue.set
*/

export const setObjPropValByPath =(obj, path, val, $set) => {
  const _obj = obj;
  let temp = obj;
  let value = '';
  const pathArr = path.split('.');
  const propLen = pathArr.length;

  if (propLen > 1) {
    pathArr.forEach((p, idx) => {
      value = temp[p] || '';
      const type = getType(value).toLowerCase();
      if (type === 'object') {
          temp = value;
      } else if (type === 'array') {
        if (idx + 1 === propLen) {
          _setVal(temp, p, val);
        } else {
          temp = value;
        }
      } else {
        _setVal(temp, p, val);
      }
    });
    return;
  }
  _setVal(_obj, path, val); // path 只有一层

  function _setVal(obj, prop, val) {
    const _obj = obj ;
    // $set使属性成为可响应式，可被追踪
    $set ? $set(_obj, prop, val) : (_obj[prop] = val);
  }
};

/**
 * 根据属性路径获取对象的属性值
 * @param {Object} obj 检索对象
 * @param {String} path 检索路径，多层路径用'.'分割，如：a.b 
 * @param {Boolean} initUndefined 不存在该属性时是否初始化该属性，默认为false 
 * @returns {any} 返回检索路径对应的属性的值
*/
 export const getObjPropValByPath =( obj , path , initUndefined = false )=>{
  let value = obj;
  const pathArr = path.split('.');
  const propLen = pathArr.length;

  if (propLen > 1) {
    try {
      pathArr.forEach((p, idx) => {
        const subValue = value[p];
        if (subValue === undefined && initUndefined) {
          value = idx + 1 < propLen ? {} : '';
          setObjPropValByPath(obj, pathArr.slice(0, idx + 1).join('.'), value);
        } else {
          value = subValue;
        }
      });
    } catch ( error ){
      value = undefined;
    }
    return value;
  };

  return obj [ path ];// path 只有一层
 };

/**
 * 防抖函数
 * @param {Function} fn 待执行的函数
 * @param {Number} delay 延迟执行时间，默认50ms
 * @returns {Function}
*/
export const debounce = (fn, delay = 50) => {
  let timerRef = null;
  return function (...args) {
    timerRef && clearTimeout(timerRef);
    timerRef = setTimeout(
      () => {
        fn.apply(this, args);
      },
      delay
    );
  };
};

/**
 * 过滤HTML tag 
 * @param {String} str 待过滤的字符串
*/
export const xssFilter = str => str.replace(/<.+\/?>+(.*<\/.+>)?/gi, '');

/**
 * 过滤sq1关键字
 * @param {String} str 待过滤的字符串
 */
export const sqlfilter = str =>
  str.replace(/(select|delete).+from[\s\w=><>=<=!=]*|update.+set[\s\w=<>=<=!=]*|insert\s+into[\s\w=<>=<=!=]*|(drop|create|backup|alter|truncate)\s+\S*(database|table|sequence|index|view|function)[\s\w=><>=<=!=]*/gi, '');

/**
将字符串转换成 json 或可执行的函数或返回字符串表示的变量的值
都不满足就原样返回
 * @param {String | any} str 待解析字符串，通常接受字符串来解析，但是你输入其它的非字符串类型的数据也不会出错，会原样返回
 * @param ( Object ) options 过滤选项配置，
 * xss : Boolean 用于是否过滤xss；默认开启
 * sql : Boolean 用于是否过滤sq1语句；默认开启
 * ignoreVariable : Boolean 用于是否转换字符串表示的变量，默认忽略字符串表示的变量
 * deep : Boolean 用于是否进行遍历以便深度转换，默认不进行深度转换
 * @returns {any}
 */
 export const evil = (str, options = []) => {
  const defaultOpts = { xss: true , sql: true, ignoreVariable: true, deep: false };
  const realOptions = { ...defaultOpts, ...options };
  const { xss, sql, ignoreVariable, deep } = realOptions;
  // 非字符串、为空，原样返回
  if (typeof str !==' string '|| !str ) {
    return str ;
  }
  // str 为数字的字符串表示或数字，原样返回。如'123',123
  // 开启不转换变量（ ignoreVariable = true )，存在字符串表示的全局变量时，直接返回字符串
  if (/^\ d +$/. test ( str )||( ignoreVariable && window [ str ]!== undefined )){
    return str ;
  }
  let _str = str ;
  try {
    xss && (_str = xssFilter(str));
    sql && (_str = xssFilter(str));
    // str 为对象，如：{}, [], function() {}
    // 或者为Boolean值的字符串
    // 或者为当前环境下的变量关键字，会返回该变量，如：存在变量 a = 123, 则evil('a') || evil(a)会返回123
    const result = new Fn(`return ${_str}`)();

    if (deep) {
      if (isTypeOf(result, 'object')) {
        _deepEvil(result, realOptions);
      } else if (isTypeOf(result, 'array')) {
        for (const item of result) {
          isTypeOf(item, 'object') && _deepEvil(item, realOptions);
        }
      }
    }

    return result;
  } catch(err) {
    return _str; // 原样输出
  }

  // 深度转换
  function _deepEvil(obj, realOptions) {
    const _obj = obj;
    for (const key in _obj) {
      const val = _obj[key];
      if (isTypeOf(val, 'string')) {
        _obj[key] = evil(val, realOptions);
      } else if (isTypeOf(val, 'object')) {
        _deepEvil(val, realOptions);
      } else if (isTypeOf(val, 'array')) {
        for (const item of val) {
          isTypeOf(item, 'object') && _deepEvil(item, realOptions);
        }
      }
    }
  }
};
/**
 * 为 formData 实例添加数据
 * @param {Object} data 特添加到表单的数据对象，支持对象和数组嵌套
 * @param {Array<String | RegExp>} excludes optional 需要排除的待添加对象的属性，多级属性时使用完整的属性路径或者使用正则表达式匹配
 * @param {Boolean} primitiveArr2JsonStr optional 默认值true ，是否将由原始值（字符串、数字、Boolean）组成的数组转换成json字符串作为表单属性的值
 * @returns {FormData} 返回FormData实例
 * eg : appendFormData(data, ['prop', "parent.son', /extProfile.[\S]+.codeItemList/]);
*/
export const appendFormData = (data, excludes = [], primitiveArr2JsonStr = true) => {
  const formDataIns = new FormData();
  const needExclude = !!excludes.length;
  const regList = excludes.filter(ext => isTypeOf(ext, 'RegExp'));
  const append = function (k, v) {
    if (isValidVal(v)) {
      // 需要排除该属性
      if (
        needExclude &&
        (excludes.includes(k) || (regList.length && regList.some(reg => reg.test(k))))
      ) {
        return;
      }
      formDataIns.append(k, v);
    }
  };

  //遍历对象添加数据到formDataIns 
  const addFormdata = (key, value) => {
    if (Array.isArray(value)) {
      // 判断是否将由原始值组成的数组转换成 json 字符串作为表单属性的值
      if (
        primitiveArr2JsonStr &&
        value.every(i => !isTypeOf(i, 'object') && !isTypeOf(i, 'array')) // 判断数组是否是由原始值组成
      ) {
        append(key, JSON.stringify(value));
      } else {
        value.forEach((item, index) => {
          addFormdata(`${key}[${index}]`, item);
        });
      }
    } else if (isTypeOf(value, 'object')) {
        Object.keys(value).forEach(sonKey => {
          addFormdata(`${key}.${sonKey}`, value[sonKey]);
      });
    } else {
      append(key, isTypeOf(value, 'null') ? '' : value); // value值为null时转换为空字符串存储，避免存'null'
    }
  };
  
  Object.keys(data).forEach(key => {
    addFormdata(key, data[key]);
  });

  return formDataIns;
};

/**
 * 对象数组按对象的属性排序
 * @param {Array<Object>} arr 对象数组
 * @param {String} prop 排序的属性
 * @param {Enum(asc, desc)} order 排序方式，默认asc(正序)排列
 * @returns {Array<Object>} 排序后的数组
 */
export const sortObjectArrayByProp = (arr, prop = 'label', order = 'asc') => {
  return arr.sort((a, b) => {
    const aProp = a[prop];
    const bProp = b[prop];
    let flag = order === 'asc' ? 1 : -1;

    if (aProp > bProp) return flag;
    if (aProp < bProp) return -flag;
    return 0; // equal
  });
};

export const uuid = function() {
  function s4() {
    return Math.floor(65536 * Math.random()).toString(16);
  }

  const rd =
    s4() +
    '_' +
    s4() +
    '_' +
    s4() +
    '_' +
    Date.now()
      .toString(16)
      .slice(-4);

  return rd;
};





/**
 * 对对象的属性进行代理
 * @param {Object} dom 被代理对象
 * @param {Array<String>} properties 被代理对象的属性列表
 */
export const delegate = function(dom, properties) {
  properties.forEach(p => {
    if (!hasOwn(dom, p)) return;
    if (!dom[p]) return;
    if (this[p]) return;
    if (isFunction(dom[p])) {
      this[p] = function(...arg) {
        dom[p](...arg);
      };
    } else {
      this[p] = dom[p];
    }
  });
};
