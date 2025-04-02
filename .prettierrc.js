/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2022-02-17 10:22:05
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-02 10:33:12
 * @FilePath: \ll-ui\.prettierrc.js
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
 */
module.exports = {
  printWidth: 110,
  tabWidth: 2,
  useTabs: false, // 使用空格缩进
  semi: true, // 需要分号
  bracketSpacing: true, // 对象的括号是否留空白
  singleQuote: true, // 使用单引号
  jsxSingleQuote: true,
  quoteProps: 'as-needed', // 对象属性是否需要引号
  trailingComma: 'none', // none|es5|all 多行时尾随逗号
  jsxBracketSameLine: true, // jsx语法元素的>换行显示(不能应用于自关闭元素)
  arrowParens: 'avoid', // avoid|always 箭头函数唯一参数是否包含括号
  proseWrap: 'preserve', // always|never|preserve
  Parser: 'babel',
  htmlWhitespaceSensitivity: 'strict', // html空白敏感
  vueIndentScriptAndStyle: true, // vue文件script和style标签缩进
  // endOfLine: 'lf'
};
