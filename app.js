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
    
    // 检查登录状态
    this.checkLoginStatus()
  },

  checkLoginStatus() {
    try {
      // 使用同步方式获取本地存储
      const userInfo = wx.getStorageSync('userInfo')
      const inviteCode = this.globalData.inviteCode
      
      if (userInfo) {
        // 检查是否有_id字段
        if (userInfo._id) {
          this.globalData.userInfo = userInfo
          
          // 从云函数重新获取最新用户信息
          this.getLatestUserInfo(userInfo._id)
          
          // 如果有邀请码，根据用户状态进行跳转
          if (inviteCode) {
            this.handleInviteCode(inviteCode, userInfo)
          }
        } else {
          // 用户信息缺少_id字段，清除本地存储并跳转到登录页
          console.error('用户信息缺少_id字段，需要重新登录')
          wx.removeStorageSync('userInfo')
          this.globalData.userInfo = null
          
          // 如果有邀请码，跳转到登录页并携带邀请码
          const url = inviteCode ? `/pages/login/login?inviteCode=${inviteCode}` : '/pages/login/login'
          wx.reLaunch({
            url: url
          })
        }
      } else {
        // 未登录，如果有邀请码，跳转到登录页并携带邀请码
        if (inviteCode) {
          wx.reLaunch({
            url: `/pages/login/login?inviteCode=${inviteCode}`
          })
        }
      }
    } catch (error) {
      console.error('检查登录状态失败:', error)
      // 清除本地存储并跳转到登录页
      wx.removeStorageSync('userInfo')
      this.globalData.userInfo = null
      
      // 如果有邀请码，跳转到登录页并携带邀请码
      const inviteCode = this.globalData.inviteCode
      const url = inviteCode ? `/pages/login/login?inviteCode=${inviteCode}` : '/pages/login/login'
      wx.reLaunch({
        url: url
      })
    }
  },
  
  // 处理邀请码逻辑
  handleInviteCode(inviteCode, userInfo) {
    
    if (userInfo.familyId) {
      // 已加入家庭，跳转到首页
      wx.reLaunch({
        url: '/pages/index/index'
      })
      wx.showToast({
        title: '您已加入家庭',
        icon: 'none'
      })
    } else {
      // 未加入家庭，跳转到加入家庭页面
      wx.reLaunch({
        url: `/pages/join-family/join-family?inviteCode=${inviteCode}`
      })
    }
    
    // 清除邀请码，避免重复处理
    this.globalData.inviteCode = null
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
        
        // 处理嵌套的data字段（如果存在）
        if (latestUserInfo.data && (latestUserInfo.data.nickname || latestUserInfo.data.avatarUrl)) {
          latestUserInfo = {
            ...latestUserInfo,
            nickname: latestUserInfo.data.nickname || latestUserInfo.nickname,
            avatarUrl: latestUserInfo.data.avatarUrl || latestUserInfo.avatarUrl
          }
          // 删除嵌套的data字段
          delete latestUserInfo.data
        }
        
        this.globalData.userInfo = latestUserInfo
        // 更新本地存储
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
    categories: ['家常菜', '汤羹', '主食', '甜品', '凉菜', '热菜', '面食', '其他']
  }
})