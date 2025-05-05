/* eslint-disable no-prototype-builtins */
/**
 * 表单校验
 * 提供registerValidateType校验类型注册函数注册自己的校验类型来实现快速校验
 * 提供regValidator函数来根据正则校验字符串
 */
import AsyncValidator from 'async-validator';

function isNativeStringType(type) {
  return ['string', 'url', 'hex', 'email', 'date', 'pattern'].includes(type);
}

function isEmptyValue(value, type) {
  if (value === undefined || value === null) {
    return true;
  }

  if (type === 'array' && Array.isArray(value) && !value.length) {
    return true;
  }

  if (isNativeStringType(type) && typeof value === 'string' && !value) {
    return true;
  }

  return false;
}

function format(template) {
  let _len = arguments.length;
  let args = new Array(_len > 1 ? _len - 1 : 0);
  let _key = 1;

  for (; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  let i = 0;
  const len = args.length;
  const formatRegExp = /%[sdj%]/g;

  if (typeof template === 'function') {
    return template.apply(null, args);
  }

  if (typeof template === 'string') {
    const str = template.replace(formatRegExp, function(x) {
      if (x === '%%') {
        return '%';
      }

      if (i >= len) {
        return x;
      }

      let val = '';
      switch (x) {
        case '%s':
          return String(args[i++]);
        case '%d':
          return Number(args[i++]);
        case '%j':
          try {
            val = JSON.stringify(args[i++]);
          } catch (error) {
            val = '[Circular]';
          }
          return val;
        default:
          return x;
      }
    });

    return str;
  }

  return template;
}

function required(rule, value, source, errors, options, type) {
  if (rule.required && (!source.hasOwnProperty(rule.field) || isEmptyValue(value, type || rule.type))) {
    errors.push(format(options.messages.required, rule.fullField));
  }
}

/**
 * 正则校验函数，根据给定的正则表达式验证给定字符串是否合法
 * @param {String} str 待验证字符串
 * @param {RegExp|String} reg 正则表达式实例或可转换为正则表达式的字符串
 * @returns {Boolean} 验证结果
 */
export const regValidator = function(str, reg) {
  // 内容为空，跳过校验
  if (!str) return true;

  if (typeof str !== 'string' && typeof str !== 'number') {
    throw new Error(`[ll-form]:参数str的类型必须是String或Number`);
  }

  if (Object.prototype.toString.call(reg) === '[object RegExp]') {
    return reg.test(str);
  } else {
    try {
      reg = new RegExp(reg);
      return reg.test(str);
    } catch (error) {
      console.error('[ll-form]:将reg参数转换为正则表达式失败', error);
      return false;
    }
  }
};

// async-validator默认支持的校验类型（type）
export const existsTypes = [
  'integer',
  'float',
  'array',
  'email',
  'number',
  'date',
  'url',
  'regexp',
  'object',
  'method',
  'hex'
];

export const defaultTypes = existsTypes;

/**
 * 为async-validator添加自定义的校验类型（type）
 * @param {String} type 类型标识
 * @param {RegExp | String} reg 正则表达式实例或能转换为正则实例的字符串
 * @param {String} msg 错误提示信息，可选，不填该项则会产出默认的错误提示信息
 */
export const registerValidateType = function(type, reg, msg) {
  if (existsTypes.includes(type)) {
    console.warn(`[ll-form]:校验类型${type}已经存在`);
    return;
  }

  const validator = (function(reg, msg) {
    return function(rule, value, callback, source, options) {
      const errors = [];
      const validate = rule.required || (!rule.required && source.hasOwnProperty(rule.field));
      if (validate) {
        if (isEmptyValue(value) && !rule.required) {
          return callback();
        }

        required(rule, value, source, errors, options, type);

        if (value !== undefined) {
          if (!regValidator(value, reg)) {
            const _msg =
              msg || format(options.messages[type], rule.fullField) || `值${value}匹配正则表达式${reg}失败`;
            errors.push(_msg);
          }
        }
      }

      callback(errors);
    };
  })(reg, msg);

  AsyncValidator.register(type, validator);
};

/**
 * 批量注册校验类型
 * @param {Array<{ type: String, reg: RegExp | String, message?: String }>} types 待注册的校验类型配置对象集合
 */
export const registerValidateTypes = function(types) {
  types.forEach(({ type, reg, message }) => {
    registerValidateType(type, reg, message);
  });
};

export default regValidator;
