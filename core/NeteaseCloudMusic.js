/**
 * 网易云音乐每日签到
 *
 * 适配常见页面路径：我的 -> 签到。不同客户端版本或账号状态的控件文案
 * 可能不同，脚本只会在识别到明确的成功状态后标记任务完成。
 */
let singletonRequire = require('../lib/SingletonRequirer.js')(runtime, global)
let widgetUtils = singletonRequire('WidgetUtils')
let commonFunctions = singletonRequire('CommonFunction')

let BaseSignRunner = require('./BaseSignRunner.js')

function SignRunner () {
  BaseSignRunner.call(this)

  let packageName = 'com.netease.cloudmusic'
  let signEntryPattern = '^(每日)?签到$|签到领.*|立即签到'
  let signedPattern = '签到成功|已签到|明日再来|明日可签到|连续签到.*天|已连续签到'

  this.exec = function () {
    this.openPackageAndSkipDialog(packageName)
    if (commonFunctions.myCurrentPackage() !== packageName) {
      this.pushErrorLog('网易云音乐未成功打开')
      return
    }

    if (this.isSigned()) {
      this.pushLog('今日已签到')
      this.setExecuted()
      commonFunctions.minimize(packageName)
      return
    }

    if (!this.openMinePage()) {
      this.pushErrorLog('无法进入网易云音乐“我的”页面')
      commonFunctions.minimize(packageName)
      return
    }

    if (this.isSigned()) {
      this.pushLog('今日已签到')
      this.setExecuted()
      commonFunctions.minimize(packageName)
      return
    }

    let signEntry = widgetUtils.widgetGetOne(signEntryPattern, 5000, false, true)
    if (!this.displayButtonAndClick(signEntry, '网易云音乐签到')) {
      this.pushErrorLog('未找到网易云音乐签到入口')
      commonFunctions.minimize(packageName)
      return
    }

    sleep(1500)
    if (this.isSigned(5000)) {
      this.pushLog('网易云音乐签到完成')
      this.setExecuted()
    } else {
      this.pushErrorLog('未识别到网易云音乐签到成功状态')
    }
    commonFunctions.minimize(packageName)
  }

  this.openMinePage = function () {
    let mine = widgetUtils.widgetGetOne('^我的$', 5000, false, true)
    if (!mine) {
      return false
    }
    this.displayButtonAndClick(mine, '我的')
    sleep(1200)
    return true
  }

  this.isSigned = function (timeout) {
    return !!widgetUtils.widgetGetOne(signedPattern, timeout || 1500, false, true)
  }
}

SignRunner.prototype = Object.create(BaseSignRunner.prototype)
SignRunner.prototype.constructor = SignRunner

module.exports = new SignRunner()
