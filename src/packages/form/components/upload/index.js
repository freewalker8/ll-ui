import { isTypeOf } from '@/utils/util';
import EchoImg from './EchoImg';

export default {
  name: 'LlUpload',
  inheritAttrs: false,
  components: { EchoImg },
  props: {
    attrs: Object,
    value: [String, Number, Object, Array],
    calcFormElWidth: Function
  },
  computed: {
    isPreviewImg() {
      const { autoUpload, previewImg = true } = this.attrs;
      return previewImg && (!autoUpload || this.asyncUploadSuccess);
    }
  },
  data() {
    return {
      uploading: false,
      asyncUploadSuccess: false,
      innerFileList: this.attrs.fileList || []
    };
  },
  render() {
    const {
      prop,
      tip,
      width,
      trigger,
      httpRequest,
      uploadText = '点击上传',
      thumbWidth = 'auto',
      thumbHeight = 'auto',
      previewImg = true,
      viewBigPic,
      nativeOn = {},
      onChange: originOnChange,
      onRemove: originOnRemove,
      ...props
    } = this.attrs;
    const { autoUpload = true, multiple = false, action, accept } = props;
    let files = this.innerFileList;
    let showTrigger = multiple || !(previewImg && Array.isArray(files) && files.length);

    const proxyHttpRequest = params => {
      this.uploading = true;
      this.asyncUploadSuccess = false;
      httpRequest(params)
        .then(() => {
          this.asyncUploadSuccess = true;
        })
        .catch(error => {
          // 删除上传失败的文件
          files = files.filter(({ name }) => name !== params.filename);
          const msg = '文件上传失败';
          this.$message && this.$message.error(msg);
          console.error(msg, err);
        })
        .finally(() => {
          this.uploading = false;
        })
    }

    return (
      <el-upload
        {...{
          props: {
            ...props,
            action: action || 'submitBySelf',
            fileList: files,
            onRemove: (file, fileList) => {
              const raws = []; // 添加的文件
              const uploadedFiles = [];
              fileList.forEach(f => {
                const { raw } = f;
                raw ? raws.push(raw) : uploadedFiles.push(f);
              });

              const realList = [...uploadedFiles, ...raws];
              this.innerFileList = realList;

              originOnRemove && originOnRemove(file, fileList); // 执行用户配置的on-remove响应

              if (autoUpload) return;

              // 更新表单项值
              if (fileList.length) {
                this.$emit('input', realList);
              } else {
                this.$emit('input', null);
              }
            },
            onChange: (file, fileList) => {
              const nameCell = file.name.split('.');
              const uploadFileType = nameCell[nameCell.length - 1];
              // 检查上传文件类型是否正确，不正确将文件删除
              if (accept && !accept.split(',').some(tp => tp.trim() === `.${uploadFileType}`)) {
                this.$message.error({
                  type: 'error',
                  message: `[ll-form]:文件类型错误，接受${accept}类型的文件，但上传的文件类型为'.${uploadFileType}'`,
                  showClose: true,
                  duration: 0
                });
                fileList.pop();
                return;
              }

              const raws = [];
              const uploadedFiles = [];
              fileList.forEach(f => {
                const { raw } = f;
                raw ? raws.push(raw) : uploadedFiles.push(f);
              });

              const realList = [...uploadedFiles, ...raws];
              this.innerFileList = realList;

              originOnChange && originOnChange(file, fileList); // 执行用户配置的on-change响应

              if (autoUpload) return;

              // update
              this.$emit('input', realList);
            }
          },
          directives: [{ name: 'loading', value: this.uploading }],
          style: {
            width: this.calcFormElWidth(width)
          },
          nativeOn,
          ref: `uploadRef_${prop}`
        }}
      >
        {showTrigger ? (
          trigger ? (<template slot="trigger">{trigger}</template>)
            : (
              <div style="text-align: left">
                <el-button size={this.size} type="primary">{uploadText}</el-button>
              </div>
            )
        ) : (
          <template slot="trigger">
            <span style="display: none"></span>
          </template>
        )}
        {tip ? <template slot="tip">{tip}</template> : accept ? `只能上传${accept}格式的文件` : null}
        {this.isPreviewImg && isTypeOf(files, 'array') && files.map(img => {
          <echo-img raw={img} {...{ props: { viewBigPic, thumbHeight, thumbWidth } }}></echo-img>
        })}
      </el-upload>
    );
  }
}