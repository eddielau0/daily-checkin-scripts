const OCRConfig = {
  mixins: [mixin_common],
  name: 'OCRConfig',
  data() {
    return {
      ocrPriorityOptions: [
        { text: '自动', value: 'auto' },
        { text: 'mlkit优先', value: 'mlkit' },
        { text: 'paddle优先', value: 'paddle' },
      ],
      configs: {
        // 本地ocr优先级
        local_ocr_priority: 'auto',
      }
    }
  },
  methods: {

  },
  template: `
  <div>
    <tip-block>AutoJs6 6.7可直接使用内置ML Kit OCR；使用Paddle OCR前，请先在AutoJs6插件中心安装Paddle OCR插件。其他兼容版AutoJS仍按已安装的OCR能力自动选择。</tip-block>
    <tip-block>签到功能界面复杂，建议使用PaddleOCR，mlkit-ocr对中文的支持不是特别好，单个数字或者浅色背景下不能准确识别。</tip-block>
    <van-cell title="本地OCR优先级">
      <template #right-icon>
        <van-dropdown-menu active-color="#1989fa" class="cell-dropdown">
          <van-dropdown-item v-model="configs.local_ocr_priority" :options="ocrPriorityOptions" />
        </van-dropdown-menu>
      </template>
    </van-cell>
  </div>
  `
}
