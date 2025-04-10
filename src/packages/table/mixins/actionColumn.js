/*
 * @Author: lianglei stone.ll@qq.com
 * @Date: 2025-04-02 10:59:59
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-10 12:39:45
 * @FilePath: \ll-form-table\src\packages\table\mixins\actionColumn.js
 * @Description: 操作列
 */
import { merge } from 'lodash-es';
import { isFunction, sortObjectArrayByProp } from '../../../utils/util';

export default {
  props: {
    actionColumn: {
      type: Object,
      default() {
        return {
          props: {
            label: '操作',
            width: '100px'
          },
          buttons: [],
          render: null
        };
      }
    },
    computed: {
      // 是否展示操作列
      showActionColumn() {
        const { buttons, render } = this.innerActionColumn;
        return buttons.length > 0 || isFunction(render);
      },
      // 操作列配置
      innerActionColumn() {
        let baseOrder = 100;
        const { $slots } = this;
        let { label, ...actionColumn } = this.actionColumn;
        // 收集通过actions插槽定义的操作列按钮
        const templateActions = ($slots.columnActions || [])
          .filter(t => t.componentOptions && t.componentOptions.tag === 'el-button')
          .map(button => {
            const { componentOptions, data } = button;
            const { propsData = {}, children, listeners = {} } = componentOptions;
            let { click: hanlder } = listeners;
            const { attrs } = data;
            let label = '';

            // 按钮包含文本，只支持文本作为按钮的模板
            if (children && children.length) {
              label = children[0].text;
            }

            // 组装成buttons属性接受的按钮配置对象
            return { props: propsData, ...attrs, label, hanlder };
          });

        let { buttons = [] } = actionColumn;

        // 插槽定义的按钮放置到buttons属性配置的按钮前面
        buttons = [...templateActions, ...buttons].map(b => {
          // 没设置order属性，设置一个默认的order属性
          if (!b.order) {
            b.order = ++baseOrder;
          }

          return b;
        });

        actionColumn.buttons = sortObjectArrayByProp(buttons, 'order');

        return merge(
          {
            show: true,
            props: { label: label || '操作' }
          },
          actionColumn
        );
      }
    }
  },
  data() {
    return {
      actionColumnProp: 'action_column_4611_eded_725c_fd79'
    };
  },
  methods: {
    /**
     * 渲染操作列
     * @returns {JSX}
     */
    _renderActionColumn(h) {
      return this.showActionColumn ? (
        <el-table-column
          prop={this.actionColumnProp}
          {...{
            attrs: this.innerActionColumn.props,
            props: {
              'label-class-name': 'll-table__action-column'
            },
            scopedSlots: {
              default: scope => {
                return (
                  <div class='ll-table__action-list'>
                    {/* 支持传递buttons配置 */}
                    {this.innerActionColumn.buttons.map(button => {
                      const { type: buttonType, icon, props, handler, label } = button;
                      let buttonProps = Object.assign(
                        {
                          type: buttonType || 'text',
                          icon
                        },
                        props
                      );

                      let clickHandler = function() {
                        handler && handler(scope);
                      };

                      return (
                        <el-button onClick={clickHandler} {...{ attrs: buttonProps }}>
                          {label}
                        </el-button>
                      );
                    })}
                    {/* 支持render渲染 */}
                    {isFunction(this.innerActionColumn.render) && (
                      <Render render={this.innerActionColumn.render} {...scope}></Render>
                    )}
                  </div>
                );
              }
            }
          }}></el-table-column>
      ) : null;
    }
  }
};
