// app.js
App({
  onLaunch() {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        traceUser: true
      })
    }
    
    // 检查登录状态
    this.checkLoginStatus()
  },
  
  checkLoginStatus() {
    wx.getStorage({  
      key: 'userInfo',
      success: (res) => {
        this.globalData.userInfo = res.data
      },
      fail: () => {
        // 未登录，后续在个人中心页处理
      }
    })
  },
  
  globalData: {
    userInfo: null,
    familyInfo: null,
    categories: ['家常菜', '汤羹', '主食', '甜品', '凉菜', '热菜', '面食', '其他']
  }
})