import { debounce } from 'lodash-es';

function resizeListen(el, value, isListen = true) {
  let {
    fixHeight, // 修正系数，除了表格内容高度以外的其他表格元素的高度和
    minHeight, // 表格内容区最小高度
    paginationFixedOnButton, // 分页栏是否固定到底部
    instance
  } = value;
  let maxHeight; // 表格最大高度

  const tableContentEl = el.querySelector('.el-table__body-wrapper');

  if (!tableContentEl) {
    return;
  }

  function _resize(offset = 0) {
    maxHeight = window.innerHeight - el.offsetTop - fixHeight || fixHeight + offset;
    maxHeight = maxHeight > minHeight ? maxHeight : minHeight; // 设置了最小高度
    tableContentEl.style[paginationFixedOnButton ? 'height' : 'maxHeight'] = maxHeight + 'px';
    instance.$emit('table-resize', maxHeight); // 发送表格resize事件，不展示横向滚动条时监听事件进行列展示变更
  }

  const _resizeDebounce = debounce(_resize, 100);

  _listen();

  function _listen() {
    const behavior = isListen ? 'addEventListener' : 'removeEventListener';
    tableContentEl.style['overflow-y'] = 'auto';

    window[behavior]('resize', _resizeDebounce);

    // 等待dom渲染完成再执行计算
    instance.$nextTick(_resize);
  }

  instance.$once('ll-table:mounted', _listen);
  if (isListen) {
    // 表格列排序后重新绑定resize事件
    instance.$on('column-sorted', _listen);
    instance.$on('ll-table:calc', _listen);
  } else {
    // 组件销毁，取消监听
    instance.$off('column-sorted', _listen);
    instance.$off('ll-table:calc', _listen);
  }
}

export default {
  bind(el, binding) {
    resizeListen(el, binding.value);
  },
  unbind(el, binding) {
    resizeListen(el, binding.value, false);
  }
}