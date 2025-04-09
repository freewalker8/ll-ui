import { getObjArrayItemByKeyValue, isFunction } from "../../../utils/util";

/**
 * 表格列字段转换
 * @param {Function} h createElement
 * @param {Object} params
 * @param {String} other
 */
 export const highLightTransfer = (h, params, other = '') => {
  let value = other || params.row[params.column.property] || '';
  let type = Object.prototype.toString.call(value);
  let val = type === '[object Array]' ? value[0].ip : type === '[object Object]' ? value.ip : value;
  let temp = val.toString().indexOf("<span style='color:red'>") > -1;

  return h('span', temp ? { domProps: { innerHTML: val } } : [val]);
};

/**
 * 获取表格单元格空值占位字符串
 * @param {any} val 单元格内容
 * @param {VM} _self 表格实例
 * @param {Object} DefaultProps 表格全局属性配置
 * @returns {String} 占位符
 */
export const getEmptyPlaceholderVal = (val, _self, DefaultProps) => {
  const { emptyPlaceholder, $attrs } = _self;
  let _emptyPlaceholder = emptyPlaceholder || DefaultProps.emptyPlaceholder;

  if (isFunction(_emptyPlaceholder)) {
    return _emptyPlaceholder(val);
  }

  const isNull = val === '' || val === null || val === undefined;

  return isNull ? _emptyPlaceholder : val;
}

/**
 * 将空值渲染为占位符
 * @param {Object} DefaultProps 组件全局属性配置
 * @returns {JSX} 占位符
 */
export const emptyPlaceholderRender = DefaultProps => {
  return (h, scope) => {
    const { row, column, _self } = scope;
    const val = row[column.property];
    const value = val || getEmptyPlaceholderVal(val, _self, DefaultProps);

    return h('span', {
      class: {
        'll-table__empty-placeholder': true
      }
    }, value);
  }
};

let isValueSaved = false; // 值是否保存
let isManualCancel = false; // 是否手动取消编辑
export const editableRender = (prop, propsData, DefaultProps) => {
  return (h, scope) => {
    const { row, $index, _self } = scope;
    const { size } = _self.$attrs;
    const { clickEdit = _self.clickEdit, autoSave = _self.autoSave, editorFormatter } = propsData;
    const id = `ll-table__cell_${prop}_${$index}`;

    const isValueChanged = () => {
      const { curTableDataBak, rowKey } = _self;
      const newVal = row[prop];
      const originRow = (getObjArrayItemByKeyValue(curTableDataBak, rowKey, row[rowKey]) || {}).item || {};

      return {
        changed: originRow[prop] !== newVal,
        newVal,
        originRow
      };
    };

    const emitCellChange = () => {
      clickEdit && _self.$set(row, '_showInput', false);
      const { changed, originRow, newVal } = isValueChanged();

      if (changed) {
        clickEdit && delete row._showInput;
        _self.$emit('cell-change', newVal, prop, row, $index);
        _self._emitDataEdit(); // 发送数据编辑事件和data同步事件
        originRow[prop] = newVal; // 更新前一个状态的值
      }
    };

    const inputerFocus = () => {
      const dom = document.getElementById(id);
      dom && dom.focus();
    };

    const hideInputer = () => {
      isValueSaved = false;
      isManualCancel = false;
      if (clickEdit) {
        _self.$set(row, '_showInput', false);
        delete row._showInput;
      }
      delete row._messaged;
    };

    const handleManualBlur = () => {
      setTimeout(() => {
        const { changed } = isValueChanged();
        if (changed && row.saved === undefined && !isManualCancel) {
          const message = _self.saveMessage || DefaultProps.saveMessage;
          // 弹出提示信息后不再重复弹出
          if (row._messaged === undefined) {
            _self.$message 
              ? _self.$message({
                message,
                type: 'error',
                duration: 0,
                showClose: true
              })
              : alert(message);
            row._messaged = true;
          }
          isValueSaved = true;
          inputerFocus();
        } else {
          hideInputer();
        }

        delete row.saved;
      }, 100);
    };

    const buttonJsx = autoSave ? null : (
      <div slot="suffix">
        <el-button
          {...{
            props: { size, type: 'primary' },
            on: {
              click: () => {
                row.saved = true;
                emitCellChange();
              }
            }
          }}
        >
          {_self.saveLabel || DefaultProps.saveLabel}
        </el-button>
        <el-button
          {...{
            props: { size, type: 'default' },
            on: {
              click: () => {
                const { originRow } = isValueChanged();
                _self.$set(row, prop, originRow[prop]);
                isManualCancel = true;
              }
            }
          }}
        >
          {_self.cancelLabel || DefaultProps.cancelLabel}
        </el-button>
      </div>
    );

    const inputDataProps = {
      attrs: { id },
      props: {
        size,
        value: row[prop],
      },
      on: {
        input: v => {
          const val = isFunction(editorFormatter) ? editorFormatter(v) : v;
          _self.$set(row, prop, val);
        },
        blur: () => {
          // 自动保存
          if (autoSave) {
            emitCellChange();
          } else {
            handleManualBlur();
          }
        }
      },
      nativeOn: {
        click: e => e.stopPropagation(),
        keyup: (e) => {
          if (!_self.enterSave || !DefaultProps.enterSave) {
            return;
          }
          if (e.keyCode === 13) {           
            emitCellChange();
          }
        }
      }
    };

    const inputerJsx = <el-input {...inputDataProps}>{buttonJsx}</el-input>;

    if (!clickEdit) {
      return inputerJsx;
    }

    row._showInput === undefined && _self.$set(row, '_showInput', !clickEdit);

    return (
      <el-row
        class="ll-table__cell-editable"
        {...{
          nativeOn: {
            click: () => {
              if (isValueSaved) {
                return;
              }

              _self.$set(row, '_showInput', prop);
              _self.$nextTick(() => {
                inputerFocus();
              });
            }
          }
        }}
      >
        {row._showInput === true || row._showInput === prop 
          ? inputerJsx
          : row[prop] || getEmptyPlaceholderVal(row[prop], _self, DefaultProps)}
      </el-row>
    );
  };
}