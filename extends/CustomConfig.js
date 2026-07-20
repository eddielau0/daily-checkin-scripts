module.exports = {
  supported_signs: [
    {
      name: '网易云音乐签到',
      taskCode: 'NeteaseCloudMusic',
      script: 'NeteaseCloudMusic.js',
      // 请先单独测试通过后，再在可视化配置中启用。
      enabled: false
    },
    {
      name: '小蚕惠生活签到',
      taskCode: 'XiaoCan',
      script: 'XiaoCan.js',
      // 请先单独测试通过后，再在可视化配置中启用。
      enabled: false
    },
    {
      name: '一淘签到领钱',
      taskCode: 'YiTaoSign',
      script: 'YiTao.js',
      // 请先单独测试通过后，再在可视化配置中启用。
      enabled: false
    }
  ]
}
