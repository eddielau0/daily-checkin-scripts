let { config } = require('../../config.js')(runtime, global)

let singletonRequire = require('../SingletonRequirer.js')(runtime, global)
let LogUtils = singletonRequire('LogUtils')
let commonFunctions = singletonRequire('CommonFunction')
let autoJs6Support = typeof ocr !== 'undefined' && typeof ocr.mlkit !== 'undefined'
let legacyAutoJsSupport = typeof $mlKitOcr !== 'undefined'
let autoJsSupport = autoJs6Support || legacyAutoJsSupport

function MlkitOCR () {
  let pluginOcr = autoJsSupport ? null : (() => {
    try {
      return plugins.load('com.tony.mlkit.ocr')
    } catch (e) {
      LogUtils.warnInfo('未安装插件 请通过此链接下载MlkitOCR插件：https://github.com/TonyJiangWJ/Ant-Forest/releases/download/v1.1.1.4/mlkit-ocr-plugin-latest.apk')
    }
  })()
  this.enabled = autoJsSupport || !!pluginOcr
  if (pluginOcr && typeof pluginOcr.release !== 'undefined') {
    commonFunctions.registerOnEngineRemoved(function () {
      pluginOcr.release()
    }, 'release mlkit-plugin resource')
  }
  this.type = 'mlkit'
  if (!this.enabled) {
    LogUtils.warnInfo(['当前版本AutoJS不支持mlKitOcr且同时未安装MlkitOCR插件，自动禁用mlKitOcr功能'])
    return
  }
  this.ocr = autoJs6Support ? ocr.mlkit : (legacyAutoJsSupport ? $mlKitOcr : pluginOcr)
  this.autoJs6Support = autoJs6Support
}


/**
 * 识别图片上的文字
 * 
 * @param {imageWrapper} img 待识别图片
 */
MlkitOCR.prototype.recognize = function (img, region) {
  if (!this.enabled) {
    return ''
  }
  let start = new Date()
  let options = this.autoJs6Support && region == null ? {} : { region: region }
  let ocrResults = this.ocr.detect(img, options).filter(v => v.confidence > 0.5)
  LogUtils.debugInfo(['mklit识别文本耗时：{}ms', new Date() - start])
  LogUtils.debugInfo(['mklit识别文本信息：{}', JSON.stringify(ocrResults)])
  return ocrResults.map(v => v.label).join('\n')
}

/**
 * 识别图片上的文字 并返回位置信息
 * 
 * @param {imageWrapper} img 待识别图片
 * @param {Array} region 待识别区域
 * @param {string} regex 查找文本
 * @param {boolean} showOcrDetail 打印OCR内容
 */
MlkitOCR.prototype.recognizeWithBounds = function (img, region, regex, showOcrDetail) {
  if (!this.enabled) {
    return []
  }
  let start = new Date()
  let options = this.autoJs6Support && region == null ? {} : { region: region }
  let resultLines = this.ocr.detect(img, options).filter(v => v.confidence > 0.5)
  let result = this.autoJs6Support
    ? resultLines
    : resultLines.map(line => line.elements).reduce((a, b) => a.concat(b), [])
  LogUtils.debugInfo(['mlkit识别文本耗时：{}ms', new Date() - start])
  if (showOcrDetail) {
    LogUtils.debugInfo(['mlkit识别文本信息：{}', JSON.stringify(result)])
  }
  if (regex) {
    regex = new RegExp(regex)
    result = result.filter(r => regex.test(r.label))
  }
  return result
}

module.exports = new MlkitOCR()
