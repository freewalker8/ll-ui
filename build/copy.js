/**
 * 将package.json和docs目录拷贝到dist目录下
 */

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const copyFile = promisify(fs.copyFile);
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const mkdir = promisify(fs.mkdir);

const sourceDir = path.resolve(__dirname, '../docs'); // 源目录
const destDir = path.resolve(__dirname, '../dist/docs'); // 目标目录
const packageJsonPath = path.resolve(__dirname, '../package.json'); // package.json 路径
const distPackageJsonPath = path.resolve(__dirname, '../dist/package.json'); // dist 下的目标路径

// 递归复制目录函数
async function copyDirectory(src, dest) {
  const exists = await promisify(fs.exists)(dest);
  if (!exists) {
    await mkdir(dest, { recursive: true });
  }

  const files = await readdir(src);

  for (const file of files) {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    const fileStat = await stat(srcPath);

    if (fileStat.isDirectory()) {
      await copyDirectory(srcPath, destPath);
    } else {
      console.log(`Copying file: ${srcPath} to ${destPath}`);
      await copyFile(srcPath, destPath);
    }
  }
}

// 主函数
async function main() {
  try {
    // 复制 package.json 到 dist 目录
    console.log(`Copying package.json to dist`);
    await copyFile(packageJsonPath, distPackageJsonPath);

    // 复制 docs 目录到 dist/docs
    console.log(`Copying docs directory to dist/docs`);
    await copyDirectory(sourceDir, destDir);

    console.log('Copy completed successfully.');
  } catch (error) {
    console.error('Error during copy:', error);
    process.exit(1);
  }
}

main();
