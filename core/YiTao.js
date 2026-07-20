/**
 * 一淘签到领钱
 *
 * 页面路径：首页顶部「签到领钱」 -> 「每日签到领钱」卡片 -> 「领取」。
 * 一淘页面文案和布局可能随版本变化，因此只在识别到明确的签到结果后
 * 标记任务完成，避免把进入页面或误点其他任务当成签到成功。
 */
let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, global)
let widgetUtils = singletonRequire('WidgetUtils')
let commonFunctions = singletonRequire('CommonFunction')
let localOcrUtil = require('../lib/LocalOcrUtil.js')

let BaseSignRunner = require('./BaseSignRunner.js')

function SignRunner () {
  BaseSignRunner.call(this)

  let packageName = 'com.taobao.etao'
  // 首页入口在顶部横向卡片区域，避免匹配签到页或商品内容中的同名文案。
  let homeEntryPattern = '^签到领钱$'
  // 签到页第一张每日卡片的按钮。区域限制用于排除下方任务列表的按钮。
  let collectPattern = '^领取$'
  // 这些文案只作为签到成功确认，不能仅凭进入签到页标记完成。
  let signedPattern = '签到成功|今日已签到|已签到|已领取|明日再来|明日可签到|连续签到.*天|已连续签到'

  this.exec = function () {
    try {
      this.openPackageAndSkipDialog(packageName)
      if (commonFunctions.myCurrentPackage() !== packageName) {
        this.pushErrorLog('一淘未成功打开，当前包名：' + commonFunctions.myCurrentPackage())
        return
      }

      if (!this.openSignPage()) {
        this.pushErrorLog('未找到一淘首页「签到领钱」入口，请提供首页布局分析或截图')
        return
      }

      if (this.isSigned(1200)) {
        this.pushLog('一淘今日已签到')
        this.setExecuted()
        return
      }

      if (!this.collectToday()) {
        this.pushErrorLog('未找到一淘签到页第一张卡片的「领取」按钮，请提供签到页布局分析或截图')
        return
      }

      if (this.isSigned(5000)) {
        this.pushLog('一淘签到完成')
        this.setExecuted()
      } else {
        this.pushErrorLog('点击「领取」后未识别到明确的签到成功状态，暂不标记完成')
      }
    } finally {
      commonFunctions.minimize(packageName)
    }
  }

  this.openSignPage = function () {
    let topHomeFilter = this.boundsFilter(0, 0, device.width, Math.floor(device.height * 0.38))
    let entry = widgetUtils.widgetGetOne(homeEntryPattern, 5000, false, true, topHomeFilter)
    if (this.displayButtonAndClick(entry, '一淘签到领钱入口')) {
      sleep(1500)
    } else if (this.captureAndCheckByOcr(homeEntryPattern, '一淘签到领钱入口', [0, 0, device.width, Math.floor(device.height * 0.38)], 800, true, 2)) {
      sleep(1500)
    } else {
      return false
    }

    // 日志已确认首页入口可点击，但签到页主体不会稳定暴露在无障碍节点树中。
    // 不以标题作为进入成功条件，后续直接通过“已签到”状态或“领取”按钮确认页面。
    this.pushLog('已点击一淘签到领钱入口，继续检查签到状态和领取按钮')
    sleep(1200)
    return true
  }

  this.collectToday = function () {
    let topSignFilter = this.boundsFilter(0, 0, device.width, Math.floor(device.height * 0.48))
    let collect = widgetUtils.widgetGetOne(collectPattern, 5000, false, true, topSignFilter)
    if (this.displayButtonAndClick(collect, '一淘今日签到领取')) {
      sleep(1200)
      return true
    }

    return !!this.captureAndCheckByOcr(
      collectPattern,
      '一淘今日签到领取',
      [0, 0, device.width, Math.floor(device.height * 0.48)],
      800,
      true,
      2)
  }

  this.isSigned = function (timeout) {
    let topSignFilter = this.boundsFilter(0, 0, device.width, Math.floor(device.height * 0.62))
    if (widgetUtils.widgetGetOne(signedPattern, timeout || 1500, false, true, topSignFilter)) {
      return true
    }

    if (!localOcrUtil.enabled) {
      return false
    }

    return !!this.captureAndCheckByOcr(
      signedPattern,
      '一淘签到成功状态',
      [0, 0, device.width, Math.floor(device.height * 0.62)],
      300,
      false,
      1)
  }

  this.boundsFilter = function (left, top, right, bottom) {
    return function (selector) {
      return selector.boundsInside(left, top, right, bottom)
    }
  }
}

SignRunner.prototype = Object.create(BaseSignRunner.prototype)
SignRunner.prototype.constructor = SignRunner

module.exports = new SignRunner()
