import { isTypeOf } from "../../../../utils/util";

export default {
  name: 'EchoImg',
  props: ['raw', 'viewBigPic', 'thumbWidth', 'thumbHeight'],
  data() {
    return {
      url: ''
    };
  },
  watch: {
    raw: {
      deep: true,
      immediate: true,
      handler(raw) {
        this.setUrl(raw);
      }
    }
  },
  computed: {
    name() {
      return (this.raw || {}).name || '';
    }
  },
  methods: {
   setUrl(raw) {
    if (!raw) return;
    if (isTypeOf(raw, 'file')) {
      if (raw.type.includes('image/')) {
        const reader = new FileReader();
        reader.onload = e => {
          this.url = e.target.result;
        }
        reader.readAsDataURL(raw);
      }
    } else {
      try {
        this.url = raw.url;
      } catch (error) {
        this.url = '';
        console.error('读取图片URL失败', error);
      }
    }
   },
   viewBigImg() {
    if (!this.viewBigPic) return;

    const ww = window.innerWidth;
    const wh = window.innerHeight;
    const imgDom = document.createElement('img');
    imgDom.src = this.url;

    let imgW = imgDom.width;
    let imgH = imgDom.height;
    const padding = 60;
    let shrink = ww / wh;

    // 视窗宽度小于图片宽度
    if (ww < imgW) {
      shrink = imgW / ww;
      imgW = ww;
      imgH = imgH / shrink;
    } 
    if (wh < imgH) {
      shrink = imgH / wh;
      imgH = wh;
      imgW = imgW / shrink;
    }

    imgW = imgW - padding;
    imgH = imgH - padding;

    const left = (ww - imgW) / 2;
    const top = (wh - imgH) / 2;

    imgDom.width = imgW;
    imgDom.height = imgH;
    imgDom.style.position = 'absolute';
    imgDom.style.left = `${left}px`;
    imgDom.style.top = `${top}px`;
    imgDom.style.zIndex = 9999999;
    imgDom.style.boxShadow = '10px 10px 10px 1px #aaa';
    imgDom.style.id = 'll-form-view-big-img';
    imgDom.title = '点击关闭';
    imgDom.addEventListener('click', function (e) {
      let dom = e.target;
      dom.parentElement.removeChild(dom);
      dom = null; // clear
    });
    document.body.appendChild(imgDom);
   } 
  },
  render() {
    const { url } = this;
    let template = '';
    if (url) {
      const { name, thumbHeight, thumbWidth, viewBigImg } = this;
      template = (
        <img
          src={url}
          title={name}
          height={thumbHeight}
          width={thumbWidth}
          class={'ll-form__uploader--img'}
          onClick={viewBigImg}
        ></img>
      )
    }

    return template;
  }
}