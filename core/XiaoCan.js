/**
 * 小蚕惠生活每日签到
 *
 * 当前已知入口为底部导航栏的第 3 项。签到页按钮及成功提示会随版本
 * 变化，因此仅在识别到明确的已签到状态后标记任务完成。
 */
let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, global)
let widgetUtils = singletonRequire('WidgetUtils')
let automator = singletonRequire('Automator')
let FloatyInstance = singletonRequire('FloatyUtil')
let commonFunctions = singletonRequire('CommonFunction')

let BaseSignRunner = require('./BaseSignRunner.js')

function SignRunner () {
  BaseSignRunner.call(this)

  let packageName = 'com.realtech.xiaocan'
  let startupAdSkipPattern = '^跳过\\s*(\\|\\s*\\d+)?$'
  // 只匹配实际可操作的签到入口，避免误点页面标题或底部导航。
  let signEntryPattern = '^(每日)?签到$|^立即签到$|^今日签到$|^去签到$'
  // 只有出现这些明确结果时才会记录为已完成。
  let signedPattern = '签到成功|今日已签到|已签到.*明日|明日再来|明日可签到'

  this.exec = function () {
    // 基础方法的默认“跳过”查找范围过宽，可能误点广告落地页的底部按钮。
    // 开屏广告由 dismissStartupAd 单独处理。
    this.openPackageAndSkipDialog(packageName, ['\\s*允许\\s*', '\\s*下次再说\\s*'])
    if (commonFunctions.myCurrentPackage() !== packageName) {
      this.pushErrorLog('小蚕惠生活未成功打开，当前包名：' + commonFunctions.myCurrentPackage())
      return
    }

    this.dismissStartupAd()

    if (this.isSigned()) {
      this.pushLog('小蚕惠生活今日已签到')
      this.setExecuted()
      commonFunctions.minimize(packageName)
      return
    }

    this.openThirdTab()
    if (this.isSigned()) {
      this.pushLog('小蚕惠生活今日已签到')
      this.setExecuted()
      commonFunctions.minimize(packageName)
      return
    }

    let signEntry = widgetUtils.widgetGetOne(signEntryPattern, 5000, false, true)
    if (!this.displayButtonAndClick(signEntry, '小蚕惠生活签到')) {
      this.pushErrorLog('已进入底部第3项，但未找到签到入口。请提供该页的布局分析或截图，以补充控件规则。')
      commonFunctions.minimize(packageName)
      return
    }

    sleep(1500)
    if (this.isSigned(5000)) {
      this.pushLog('小蚕惠生活签到完成')
      this.setExecuted()
    } else {
      this.pushErrorLog('点击签到后未识别到“签到成功”或“今日已签到”状态，请提供签到后的布局分析或截图。')
    }
    commonFunctions.minimize(packageName)
  }

  this.openThirdTab = function () {
    // 5 个底部导航项时，第 3 项位于屏幕水平中点。使用相对坐标以适配分辨率。
    let x = Math.floor(device.width / 2)
    let y = Math.floor(device.height * 0.94)
    FloatyInstance.setFloatyInfo({ x: x, y: y }, '小蚕惠生活底部第3项')
    this.pushLog('进入小蚕惠生活底部第3项：' + x + ', ' + y)
    automator.click(x, y)
    sleep(1500)
  }

  this.dismissStartupAd = function () {
    let attempts = 8
    let clicked = false
    // 开屏广告的跳过按钮固定在上半屏。过滤下半屏可避免点击广告落地页的“跳过”。
    let topHalfFilter = function (selector) {
      return selector.boundsInside(0, 0, device.width, Math.floor(device.height * 0.45))
    }
    while (attempts-- > 0) {
      let skipButton = widgetUtils.widgetGetOne(
        startupAdSkipPattern,
        700,
        false,
        true,
        topHalfFilter
      )
      if (skipButton) {
        this.pushLog('发现小蚕惠生活开屏广告，点击右上角跳过')
        this.displayButtonAndClick(skipButton, '跳过开屏广告', 200)
        clicked = true
        sleep(800)
        continue
      }
      sleep(100)
    }
    if (clicked) {
      this.pushLog('开屏广告已跳过')
    }
  }

  this.isSigned = function (timeout) {
    return !!widgetUtils.widgetGetOne(signedPattern, timeout || 1200, false, true)
  }
}

SignRunner.prototype = Object.create(BaseSignRunner.prototype)
SignRunner.prototype.constructor = SignRunner

module.exports = new SignRunner()
