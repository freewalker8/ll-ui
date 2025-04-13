import { getObjPropValByPath, setObjPropValByPath, isTypeOf } from '@/utils/util';
import Upload from '@/packages/form/components/upload';

window.llFormOpenedWindow = null; // 存储dialog类型打开的弹窗的引用

export default {
  components: { Upload },
  data() {
    const genComponentConfig = this.genComponentConfig;
    const timePicker = (h, attrs) => {
      const componentConfig = genComponentConfig(attrs);
      return <el-time-picker {...componentConfig}></el-time-picker>;
    };
    const datePicker = (h, attrs) => {
      const componentConfig = genComponentConfig(attrs);
      return <el-date-picker {...componentConfig}></el-date-picker>;
    };

    return {
      dialogLoadingRef: null,
      // 表单类型
      formItemTypeMap: {
        input: (h, attrs) => {
          const componentConfig = genComponentConfig(attrs);
          return <el-input {...componentConfig}></el-input>;
        },
        inputNumber: (h, attrs) => {
          const componentConfig = genComponentConfig(attrs);
          componentConfig.attrs.type = 'textarea';
          return <el-input-number {...componentConfig}></el-input-number>;
        },
        textarea: (h, attrs) => {
          const componentConfig = genComponentConfig(attrs);
          componentConfig.attrs.type = 'textarea';
          return <el-input {...componentConfig}></el-input>;
        },
        select: (h, attrs) => {
          let { prop, options = [], formElementProps, remoteMethod, remote } = attrs;
          const componentConfig = genComponentConfig(attrs);
          const { multiple } = componentConfig.props;
          const id = `select_${prop}`;
          let isGroupSelect = false;
          let childrenOptionsKey = 'options';

          if (options.length) {
            isGroupSelect = options.every(opt => {
              let flag = false;
              Object.entries(opt).forEach(([key, val]) => {
                if (Array.isArray(val) && (val.length === 0 || isTypeOf(val[0], 'object'))) {
                  childrenOptionsKey = key;
                  flag = true;
                }
              });
              return flag;
            });
          }

          if (remote && remoteMethod) {
            // 支持远程搜索
            const remoteMethodHandler = q => {
              formElementProps.loading = true;
              const selectRef = this.$refs[id];
              const query = selectRef ? selectRef.query : '';

              setTimeout(() => {
                selectRef.visible = true; // 显示下拉框
                // fix 查询参数暂时消失
                this.$nextTick(() => {
                  multiple
                    ? selectRef.$refs.input && (selectRef.$refs.input.value = query)
                    : selectRef.$refs.reference && (selectRef.$refs.reference.$refs.input.value = query);
                });

                remoteMethod(q)
                  .then(data => {
                    formElementProps.options = data || [];
                    setTimeout(() => {
                      selectRef.visible = true;
                      // fix 搜索后搜索关键字丢失
                      this.$nextTick(() => {
                        if (multiple) {
                          selectRef.query = query;
                          selectRef.$refs.input.value = query;
                          selectRef.$refs.input.focus();
                        } else {
                          selectRef.$refs.reference.$refs.input.value = query;
                          selectRef.$refs.reference.$refs.input.focus();
                        }
                      });
                    }, 20);
                  })
                  .finally(() => {
                    formElementProps.loading = false;
                  });
              }, 10);
            };
            componentConfig.props.remoteMethod = remoteMethodHandler;
          }

          componentConfig.attrs = { ...componentConfig.props };
          componentConfig.ref = componentConfig.ref || id;
          return (
            <el-select {...componentConfig}>
              {options.map(opt => {
                return isGroupSelect && Array.isArray(opt[childrenOptionsKey]) ? (
                  <el-option-group key={opt.label} label={opt.label}>
                    {opt[childrenOptionsKey].map(subOpt => (
                      <el-option key={subOpt.value} {...{ attrs: subOpt }}></el-option>
                    ))}
                  </el-option-group>
                ) : (
                  <el-option key={opt.value} {...{ attrs: opt }}></el-option>
                );
              })}
            </el-select>
          );
        },
        switch: (h, attrs) => {
          const componentConfig = genComponentConfig(attrs);
          return <el-switch {...componentConfig}></el-switch>;
        },
        radio: (h, attrs) => {
          const componentConfig = genComponentConfig(attrs);
          return <el-radio {...componentConfig}></el-radio>;
        },
        radioGroup: (h, attrs) => {
          const { options } = attrs;
          const componentConfig = genComponentConfig(attrs);
          return (
            <el-radio-group {...componentConfig}>
              {options.map(option => {
                if (typeof option === 'string') {
                  return (
                    <el-radio label={option} key={option}>
                      {option}
                    </el-radio>
                  );
                }

                const { label, value, ...restOption } = option;
                return (
                  <el-radio label={value || label} key={value || label} {...{ attrs: restOption }}>
                    {label}
                  </el-radio>
                );
              })}
            </el-radio-group>
          );
        },
        radioButtonGroup: (h, attrs) => {
          const { options } = attrs;
          const componentConfig = genComponentConfig(attrs);
          return (
            <el-radio-group {...componentConfig}>
              {options.map(option => {
                if (typeof option === 'string') {
                  return (
                    <el-radio-button label={option} key={option}>
                      {option}
                    </el-radio-button>
                  );
                }

                const { label, ...restOption } = option;
                return (
                  <el-radio-button label={label} key={label} {...{ attrs: restOption }}>
                    {label}
                  </el-radio-button>
                );
              })}
            </el-radio-group>
          );
        },
        checkbox: (h, attrs) => {
          const componentConfig = genComponentConfig(attrs);
          return <el-checkbox {...componentConfig}></el-checkbox>;
        },
        checkboxGroup: (h, attrs) => {
          const { options } = attrs;
          const componentConfig = genComponentConfig(attrs);
          return (
            <el-checkbox-group {...componentConfig}>
              {options.map(option => {
                if (typeof option === 'string') {
                  return (
                    <el-checkbox label={option} key={option}>
                      {option}
                    </el-checkbox>
                  );
                }

                const { label, value, ...restOption } = option;
                return (
                  <el-checkbox label={value || label} key={value || label} {...{ attrs: restOption }}>
                    {label}
                  </el-checkbox>
                );
              })}
            </el-checkbox-group>
          );
        },
        checkboxButtonGroup: (h, attrs) => {
          const { options } = attrs;
          const componentConfig = genComponentConfig(attrs);
          return (
            <el-checkbox-group {...componentConfig}>
              {options.map(option => {
                if (typeof option === 'string') {
                  return (
                    <el-checkbox-button label={option} key={option}>
                      {option}
                    </el-checkbox-button>
                  );
                }

                const { label, value, ...restOption } = option;
                return (
                  <el-checkbox-button label={value || label} key={value || label} {...{ attrs: restOption }}>
                    {label}
                  </el-checkbox-button>
                );
              })}
            </el-checkbox-group>
          );
        },
        cascader: (h, attrs) => {
          const componentConfig = genComponentConfig(attrs);
          return <el-cascader {...componentConfig}></el-cascader>;
        },
        slider: (h, attrs) => {
          const componentConfig = genComponentConfig(attrs);
          return <el-slider {...componentConfig}></el-slider>;
        },
        timeSelect: (h, attrs) => {
          const componentConfig = genComponentConfig(attrs);
          return <el-time-select {...componentConfig}></el-time-select>;
        },
        timePicker: (h, attrs) => {
          return timePicker(h, attrs);
        },
        timeRangePicker: (h, attrs) => {
          return timePicker(h, { ...attrs, isRange: true });
        },
        datePicker: (h, attrs) => {
          return datePicker(h, attrs);
        },
        datesPicker: (h, attrs) => {
          return datePicker(h, { ...attrs, type: 'dates' });
        },
        yearPicker: (h, attrs) => {
          return datePicker(h, { ...attrs, type: 'year' });
        },
        monthPicker: (h, attrs) => {
          return datePicker(h, { ...attrs, type: 'month' });
        },
        weekPicker: (h, attrs) => {
          return datePicker(h, { ...attrs, type: 'week' });
        },
        monthRangePicker: (h, attrs) => {
          return datePicker(h, { ...attrs, type: 'monthrange' });
        },
        dateRangePicker: (h, attrs) => {
          return datePicker(h, { ...attrs, type: 'daterange' });
        },
        dateTimePicker: (h, attrs) => {
          return datePicker(h, { ...attrs, type: 'datetime' });
        },
        dateTimeRangePicker: (h, attrs) => {
          return datePicker(h, { ...attrs, type: 'datetimerange' });
        },
        upload: (h, attrs) => {
          const { prop } = attrs;
          const value = this.getFormItemValByPath(prop);
          const componentConfig = genComponentConfig(attrs);

          return (
            <upload
              {...{
                ...componentConfig,
                props: {
                  attrs,
                  value,
                  calcFormElWidth: this._calcFormElWidth
                },
                on: {
                  input: val => {
                    this.setFormItemValByPath(prop, val);
                  }
                }
              }}></upload>
          );
        },
        rate: (h, attrs) => {
          const componentConfig = genComponentConfig(attrs);
          return <el-rate {...componentConfig}></el-rate>;
        },
        colorPicker: (h, attrs) => {
          const componentConfig = genComponentConfig(attrs);
          return <el-color-picker {...componentConfig}></el-color-picker>;
        },
        transfer: (h, attrs) => {
          const componentConfig = genComponentConfig(attrs);
          return <el-transfer {...componentConfig}></el-transfer>;
        },
        // 弹框类型，将外部输入控件作为表单项输入控件
        dialog: (h, attrs) => {
          const { prop, url, dialogWidth, dialogHeight, top = null, left = null, nativeOn = {} } = attrs;
          // 计算弹框距离屏幕左边的距离
          const _left = left || (window.innerWidth - Number(dialogWidth)) / 2;
          const _top = top || (window.innerHeight - Number(dialogHeight)) / 2;
          const _dialogWidth = dialogWidth || 600;
          const _dialogHeight = dialogHeight || 350;
          const windowId = `ll-form-opener-input__${prop}`;
          const componentConfig = genComponentConfig(attrs);

          return (
            <el-input
              id={windowId}
              {...{
                ...componentConfig,
                nativeOn: {
                  ...nativeOn,
                  click: () => {
                    // 表单项被禁用
                    if (this.$attrs.disabled) return;

                    const { sessionStorage, open } = window;
                    sessionStorage.setItem('ll-form-opener-input-id', windowId);
                    window.llFormOpenedWindow = open(
                      url,
                      windowId,
                      `width=${_dialogWidth},height=${_dialogHeight},top=${_top},left=${_left},toolbar=no,menubar=no,location=no,status=no`
                    );
                    // 加载蒙层，使表单无法编辑
                    this.dialogLoadingRef = this.$loading({ background: 'rgba(0, 0, 0, 0)' });
                    // 关闭弹框回调
                    window.llFormOpenedWindow.onbeforeunload = () => {
                      this.dialogLoadingRef.close();
                      window.llFormOpenedWindow.onbeforeunload = null;
                      window.llFormOpenedWindow = null;
                      this.dialogLoadingRef = null;
                    };
                  }
                }
              }}></el-input>
          );
        }
      }
    };
  },
  methods: {
    genComponentConfig(options) {
      const {
        prop,
        width,
        on = {},
        nativeOn = {},
        class: domClass = '',
        style,
        props,
        domProps,
        attrs,
        key,
        ref,
        slot,
        scopedSlots,
        directives,
        ...inputerProps
      } = options;
      delete inputerProps.formElementProps;

      return {
        attrs: { ...attrs, ...inputerProps },
        props: { ...props, ...inputerProps, value: this.getFormItemValByPath(prop) },
        domProps,
        style: [{ width: this._calcFormElWidth(width) }, ...(Array.isArray(style) ? style : [style])],
        class: domClass,
        on: {
          ...on,
          input: val => {
            this.setFormItemValByPath(prop, val);
          }
        },
        nativeOn,
        directives,
        key,
        ref,
        slot,
        scopedSlots
      };
    },
    /**
     * 按路径获取表单项的值
     * @param {String} path 属性读取路径，支持子属性读取，eg:a.b
     */
    getFormItemValByPath(path) {
      return getObjPropValByPath(this.innerFormData, path);
    },
    /**
     * 按路径设置表单项的值
     * @param {String} path 属性路径
     * @param {any} val 属性值
     */
    setFormItemValByPath(path, val) {
      if (val !== this.getFormItemValByPath(path)) {
        this._markEffectedField(path);
        this.$emit('field-value-change', val, path);
      }
      setObjPropValByPath(this.innerFormData, path, val, this.$set);
    },
    /**
     * 将被影响的表单字段打上标记
     * @param {String} path 属性路径
     */
    _markEffectedField(path) {
      const effectedFields = this.effectMap[path];
      if (effectedFields) {
        this.forItems.map(item => {
          const { prop } = item;
          if (effectedFields.includes(prop)) {
            item.effected = true;
          }
        });
      }
    }
  }
};
