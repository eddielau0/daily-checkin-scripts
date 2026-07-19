/**
 * 签到代码模板
 */

// 配置信息
let { config } = require('../config.js')(runtime, global)
// 单例require 必须引用
let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, global)
// 悬浮窗组件 按需引用
let FloatyInstance = singletonRequire('FloatyUtil')
// 找控件专用 按需引用
let widgetUtils = singletonRequire('WidgetUtils')
// 自动执行专用 如点击等 按需引用
let automator = singletonRequire('Automator')
// 大部分的公共方法 按需引用
let commonFunctions = singletonRequire('CommonFunction')
// 日志打印 按需引用
let logUtils = singletonRequire('LogUtils')
// 本地OCR工具 按需引用
let localOcrUtil = require('../lib/LocalOcrUtil.js')

let BaseSignRunner = require('./BaseSignRunner.js')
function SignRunner () {
  BaseSignRunner.call(this)

  this.package_name = 'com.alicloud.databox'

  /**
   *  扩展exec代码 实现具体的签到逻辑
   */
  this.exec = function () {
    // ...
    // 在这里写签到执行的代码
    // ...

    this.openPackageAndSkipDialog(this.package_name)
    let signEntry = widgetUtils.widgetGetById('com.alicloud.databox:id/tvSignInAction')
    if (signEntry) {
      if (signEntry.text() == '领取') {
        if (!this.displayButtonAndClick(signEntry, '领取')) {
          this.pushErrorLog('签到按钮点击失败')
          commonFunctions.minimize()
          return
        }
        sleep(3000)
        signEntry = widgetUtils.widgetGetById('com.alicloud.databox:id/tvSignInAction', 3000)
        if (signEntry && signEntry.text() == '明日可领取') {
          this.setExecuted()
        } else if (!signEntry) {
          // 阿里云盘部分版本签到成功后会刷新页面并移除原签到控件。
          this.pushLog('签到控件已消失，按页面刷新判定签到完成')
          this.setExecuted()
        } else {
          this.pushErrorLog('重新校验签到是否完成失败：' + (signEntry ? '控件内容：' + signEntry.text() : '控件无法获取'))
        }
      } else if (signEntry.text() == '明日可领取') {
        this.pushLog('当前已完成签到')
        this.setExecuted()
      }
    } else {
      this.pushErrorLog('查找 领取 控件失败，id：com.alicloud.databox:id/tvSignInAction')
    }
    commonFunctions.minimize()
  }

}

SignRunner.prototype = Object.create(BaseSignRunner.prototype)
SignRunner.prototype.constructor = SignRunner
module.exports = new SignRunner()
