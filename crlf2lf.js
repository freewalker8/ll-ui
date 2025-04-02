/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2025-04-02 10:55:20
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-02 10:55:30
 * @FilePath: \ll-ui\crlf2lf.js
 * @Description: 遍历文件夹下的文件（默认src）将换行符从crlf 改为 lf
 */
const fs = require('fs');
const path = require('path');

/**
 * 递归遍历目录，将所有文件的 CRLF (\r\n) 替换为 LF (\n)
 * @param {string} dirPath 要处理的目录路径
 */
function convertCRLFtoLF(dirPath) {
  // 读取目录下的所有文件和子目录
  const items = fs.readdirSync(dirPath);

  items.forEach(item => {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      // 如果是目录，递归处理
      convertCRLFtoLF(fullPath);
    } else if (stat.isFile()) {
      // 如果是文件，读取内容并替换换行符
      try {
        let content = fs.readFileSync(fullPath, 'utf8');
        const hasCRLF = /\r\n/.test(content);

        if (hasCRLF) {
          content = content.replace(/\r\n/g, '\n');
          fs.writeFileSync(fullPath, content, 'utf8');
          console.log(`✅ 已转换: ${fullPath}`);
        }
      } catch (err) {
        console.error(`❌ 处理文件失败: ${fullPath}`, err);
      }
    }
  });
}

// 从命令行参数获取路径，默认使用 './src'
const targetDir = process.argv[2] || './src';

if (!fs.existsSync(targetDir)) {
  console.error(`❌ 目录不存在: ${targetDir}`);
  process.exit(1);
}

console.log(`🔄 开始转换目录: ${targetDir}`);
convertCRLFtoLF(targetDir);
console.log('🎉 所有文件处理完成！');
