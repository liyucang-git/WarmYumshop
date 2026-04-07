// app.js
App({
  onLaunch(options) {
    // 初始化云开发
    if (wx.cloud) {
      wx.cloud.init({
        env: 'tangyuan-3gqjbda947233e77',
        traceUser: true
      })
    } else {
      console.error('云开发 SDK 未加载')
    }

    // 处理启动参数（邀请码）
    if (options && options.query && options.query.inviteCode) {
      this.globalData.inviteCode = options.query.inviteCode
    }
    
    console.log('app onLaunch, options:', options)
    
    // 初始化用户信息
    this.initUserInfo()
  },

  // 初始化用户信息
  initUserInfo() {
    try {
      const userInfo = wx.getStorageSync('userInfo')
      
      if (userInfo && userInfo._id) {
        // 有本地用户信息，更新到 globalData
        this.globalData.userInfo = userInfo
        
        // 异步获取最新用户信息
        this.getLatestUserInfo(userInfo._id)
      }
    } catch (error) {
      console.error('初始化用户信息失败:', error)
    }
  },
  
  // 从云函数获取最新用户信息
  getLatestUserInfo(userId) {
    wx.cloud.callFunction({
      name: 'login',
      data: {
        action: 'getUserInfo',
        data: {
          userId
        }
      }
    })
    .then(res => {
      if (res.result.success) {
        let latestUserInfo = res.result.data
        
        // 处理嵌套的data字段
        if (latestUserInfo.data && (latestUserInfo.data.nickname || latestUserInfo.data.avatarUrl)) {
          latestUserInfo = {
            ...latestUserInfo,
            nickname: latestUserInfo.data.nickname || latestUserInfo.nickname,
            avatarUrl: latestUserInfo.data.avatarUrl || latestUserInfo.avatarUrl
          }
          delete latestUserInfo.data
        }
        
        this.globalData.userInfo = latestUserInfo
        wx.setStorageSync('userInfo', latestUserInfo)
      }
    })
    .catch(err => {
      console.error('获取最新用户信息失败:', err)
    })
  },

  globalData: {
    userInfo: null,
    familyInfo: null,
    categories: ['家常菜', '汤羹', '主食', '甜品', '凉菜', '热菜', '面食', '其他'],
    inviteCode: null
  },

  // 检查是否已登录
  checkIsLogin() {
    if (!this.globalData.userInfo || !this.globalData.userInfo._id) {
      return false
    }
    return true
  },

  // 检查登录并跳转
  checkLoginAndRedirect(currentPageUrl, queryParams = {}) {
    if (!this.checkIsLogin()) {
      // 未登录，保存当前页面路径和参数
      let redirectUrl = '/' + currentPageUrl
      if (Object.keys(queryParams).length > 0) {
        const queryString = Object.keys(queryParams)
          .map(key => `${key}=${encodeURIComponent(queryParams[key])}`)
          .join('&')
        redirectUrl += '?' + queryString
      }
      this.globalData.redirectUrl = redirectUrl
      
      // 跳转到登录页
      wx.reLaunch({
        url: '/pages/login/login'
      })
      return false
    }
    return true
  }
})
