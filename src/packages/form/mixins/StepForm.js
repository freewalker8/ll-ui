/*
 * @Author: freewalker8 stone.ll@qq.com
 * @Date: 2025-01-02 15:25:32
 * @LastEditors: lianglei stone.ll@qq.com
 * @LastEditTime: 2025-04-10 12:41:08
 * @FilePath: \ll-form-table\src\packages\form\mixins\StepForm.js
 * @Description: 分步表单
 */
import { flattenFormItems } from 'utils/util';

export default {
  props: {
    // 是否是分步表单
    step: {
      type: Boolean,
      default: false
    },
    // 激活的步骤
    activeStep: {
      type: Number,
      default: 0
    },
    // 上一步按钮的文本
    prevStepLabel: {
      type: String,
      default: '上一步'
    },
    // 下一步按钮的文本
    nextStepLabel: {
      type: String,
      default: '下一步'
    },
    // 步骤条容器el-steps的属性配置，step = true时生效，支持的属性请参照element-ui的el-steps组件文档
    stepAttrs: {
      type: Object,
      default() {
        return {};
      }
    },
    // 步骤条渲染位置，step = true时生效，可选值top/left
    stepsPosition: {
      type: String,
      default: 'top',
      validator(v) {
        if (['top', 'left'].includes(v)) {
          return true;
        }
        console.warn(`[ll-form][warn]:表单属性'steps-position'可选值为：'top'、'left'`);
        return false;
      }
    },
    // 步骤条宽度，step = true时生效
    stepsWidth: {
      type: [String, Number],
      default: '100%'
    },
    // 步骤条高度，step = true时生效
    stepsHeight: {
      type: [String, Number],
      default: 'auto'
    }
  },
  data() {
    return {
      innerActiveStep: this.activeStep
    };
  },
  computed: {
    stepsConfig() {
      return this.step
        ? this.formItems.map(item => {
            const { title, icon, description, status } = item;
            return { title, icon, description, status };
          })
        : [];
    }
  },
  watch: {
    activeStep(step) {
      this.innerActiveStep = step;
    }
  },
  methods: {
    /**
     * 渲染分步表单
     * @param {Function} h createElement
     * @param {Arra<FormItem>} formItems 表单项配置数组
     * @param {Number} index 索引，在数组中的位置
     * @returns {JSX} 表单项内容模板
     */
    _renderStepForm(h, formItems, index) {
      const { innerActiveStep, _renderFormItems } = this;
      return (
        <el-row
          class='ll-form__clear-both'
          {...{ directives: [{ name: 'show', value: innerActiveStep === index }] }}>
          {_renderFormItems(h, formItems)}
        </el-row>
      );
    },
    /**
     * 渲染分步栏
     * @returns {JSX} 分步栏模板
     */
    _renderSteps(h) {
      const { stepsConfig, stepAttrs, innerActiveStep, _handlerStepJump } = this;
      return (
        <el-steps
          {...{
            props: {
              active: innerActiveStep,
              processStatus: 'process',
              ...stepAttrs
            },
            class: 'll-form__steps'
          }}>
          {stepsConfig.map((stepAttrs, index) => {
            return (
              <el-step
                {...{
                  props: stepAttrs,
                  nativeOn: {
                    click: () => {
                      _handlerStepJump(index);
                    }
                  }
                }}></el-step>
            );
          })}
        </el-steps>
      );
    },
    /**
     * 响应上一步、下一步按钮点击
     * @param {Enumerator(1, -1) | Number} step 跳转方向或跳转到步骤的索引， 1（下一步或跳转到索引为1的步骤， -1（上一步），otherIndex: 跳转到该步骤
     */
    _handlerStep(step) {
      const { validate, clearValidate, innerActiveStep, formItems } = this;
      // 下一步按钮被点击或向下跳转
      if (step >= 1) {
        validate((valid, invalidInfo) => {
          if (valid) {
            this.innerActiveStep = innerActiveStep + step;
          }
          // 部分表单项未校验通过
          const currentStepFormItems = flattenFormItems(formItems[innerActiveStep].children || []);
          const invalidFields = Object.keys(invalidInfo);
          if (invalidFields.length) {
            // 判断当前步骤是否有表单项校验未通过
            const currentStepHasError = currentStepFormItems.some(({ prop }) => invalidFields.includes(prop));
            // 当前步骤校验通过才能进入下一步
            if (!currentStepHasError) {
              clearValidate(); // 清除验证状态
              this.innerActiveStep = innerActiveStep + step;
            }
          }
        });
      } else {
        // step = -1 上一步按钮被点击
        this.innerActiveStep = innerActiveStep + step;
      }
    },
    /**
     * 响应分步栏导航点击事件
     * @param {Number} index 所在步骤的索引
     */
    _handlerStepJump(index) {
      const { innerActiveStep, _handlerStep } = this;
      // 向下，需要校验上面步骤是否合规，合规才能跳转
      if (index > innerActiveStep) {
        const step = index - innerActiveStep;
        _handlerStep(step);
      } else if (index < innerActiveStep) {
        // 向上，直接跳转到所点击步骤
        this.innerActiveStep = index;
      }
    }
  }
};
