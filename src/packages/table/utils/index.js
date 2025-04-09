import { getObjArrayItemByKeyValue } from "../../../utils/util";

export const getRowIdentity = (row, rowKey) => {
  if (typeof rowKey === 'string') {
    if (rowKey.indexOf('.') < 0) {
      return row[rowKey];
    }

    let key = rowKey.split('.');
    let current = row;

    for (let i = 0, len = key.length; i < len; i++) {
      current = current[key[i]];
    }

    return current;
  } else if (typeof rowKey === 'function') {
    return rowKey.call(null, row);
  }
};

export const LL_ROW_PARENT_KEY = '__ll_row_parent_key';

export const LL_ROW_LEVEL_KEY = '__ll_row_level';

/**
 * 扁平化数组
 * @param {Array<Object>} arr 待扁平化数组
 * @param {String | Function} rowKey 唯一标识字段
 * @param {String} childrenKey ? 子节点字段
 * @param {String} parentId ? 父节点id
 * @param {Array<Object>} flatenedArr 扁平化后的数组
 * @param {Number} level ? 元素层级
 * @returns {Array<Object>} flatenedArr 扁平化后的数组
 */
export const flattenArray = (arr, rowKey, childrenKey = 'children', parentId = '', flatenedArr = [], level = 1) => {
  const _flattenedArr = flatenedArr;
  arr.forEach(item => {
    item[LL_ROW_PARENT_KEY] = parentId;
    item[LL_ROW_LEVEL_KEY] = level;
    _flattenedArr.push(item);

    const childArr = item[childrenKey];
    if (Array.isArray(childArr)) {
      const childParentId = getRowIdentity(item, rowKey);
      flattenArray(childArr, rowKey, childrenKey, childParentId, _flattenedArr, level + 1);
    }
  });

  return _flattenedArr;
}

/**
 * 还原扁平化数组
 * @param {Array<Object>} arr 待还原的扁平化数组
 * @param {String|Function} rowKey 表格数据的唯一标识符字段
 * @param {String} parentIdKey 父节点的唯一标识符字段
 * @param {String} childrenKey 孩子节点的key
 * @return {Array<Object>} 还原后的数组
 */
export const unFlattenArray = (arr, rowKey, parentIdKey, childrenKey = 'children') => {
  const unFlattenArr = [];

  arr.forEach(item => {
    const children = item[childrenKey];
    const parentId = item[parentIdKey];
    const hasChildren = !!children;

    // 存在子节点，初始化当前项的子节点数组
    if (hasChildren) {
      item[childrenKey] = [];
    }

    // 如果有父节点，将其添加到父节点的子节点数组中
    if (parentId) {
      const parent = getObjArrayItemByKeyValue(unFlattenArr, rowKey, parentId, childrenKey).item;
      delete item[parentIdKey];
      parent[childrenKey].push(item);
    } else {
      // 如果没有父节点，说明是根节点
      unFlattenArr.push(item);
    }
  });

  return unFlattenArr;
}