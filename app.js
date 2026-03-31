// app.js
App({
  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'tangyuan-3gqjbda947233e77',
        traceUser: true
      })
      console.log('云开发初始化成功，环境ID: tangyuan-3gqjbda947233e77')
    } else {
      console.error('云开发 SDK 未加载')
    }

    // 检查登录状态
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    try {
      // 使用同步方式获取本地存储
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo) {
        this.globalData.userInfo = userInfo
        console.log('已登录用户:', userInfo)
      } else {
        // 未登录，后续在登录页处理
        console.log('未找到登录信息')
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
    }
  },

  globalData: {
    userInfo: null,
    familyInfo: null,
    categories: ['家常菜', '汤羹', '主食', '甜品', '凉菜', '热菜', '面食', '其他']
  }
})