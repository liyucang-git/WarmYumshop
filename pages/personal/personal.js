// 个人中心逻辑
Page({
  data: {
    userInfo: {},
    familyInfo: {},
    showLoginModal: false
  },

  onLoad(options) {
    // 等待 userInfo 初始化后再检查登录状态
    this.waitForUserInfoInit(() => {
      const app = getApp()
      if (!app.checkLoginAndRedirect('pages/personal/personal', options)) {
        return
      }
      this.checkLoginAndLoad()
    })
  },

  onShow() {
    // 等待 userInfo 初始化后再检查
    this.waitForUserInfoInit(() => {
      this.checkLoginAndLoad()
      
      // 检查是否有邀请码
      const app = getApp()
      if (app && app.globalData && app.globalData.inviteCode) {
        const inviteCode = app.globalData.inviteCode
        
        // 获取当前用户信息
        const userInfo = this.data.userInfo
        
        if (!userInfo || !userInfo._id) {
          // 未登录，跳转到登录页
          app.globalData.inviteCode = null
          wx.navigateTo({
            url: `/pages/login/login?inviteCode=${inviteCode}`
          })
        } else if (userInfo.familyId) {
          // 已加入家庭，清除邀请码并提示
          app.globalData.inviteCode = null
          wx.showToast({
            title: '您已加入家庭',
            icon: 'none'
          })
        } else {
          // 未加入家庭，跳转到加入家庭页面
          app.globalData.inviteCode = null
          wx.navigateTo({
            url: `/pages/join-family/join-family?inviteCode=${inviteCode}`
          })
        }
      }
    })
  },
  
  // 等待 userInfo 初始化完成
  waitForUserInfoInit(callback, maxWaitTime = 1000) {
    const app = getApp()
    const startTime = Date.now()
    
    const check = () => {
      // 如果 userInfo 已初始化或有 _id，直接回调
      if (app.globalData && app.globalData.userInfo && app.globalData.userInfo._id) {
        if (callback) callback()
        return
      }
      
      // 超时则不再等待
      if (Date.now() - startTime > maxWaitTime) {
        console.log('等待 userInfo 初始化超时')
        if (callback) callback()
        return
      }
      
      // 继续等待
      setTimeout(check, 100)
    }
    
    check()
  },

  // 检查登录状态并加载用户信息
  checkLoginAndLoad() {
    const app = getApp()
    
    // 安全检查: 确保 app 和 globalData 存在
    if (!app || !app.globalData) {
      console.error('app 或 app.globalData 未初始化')
      return
    }
    
    const userInfo = app.globalData.userInfo
    
    if (userInfo) {
      this.setData({ userInfo, showLoginModal: false })
      if (userInfo.familyId) {
        this.getFamilyInfo(userInfo.familyId)
      }
    }
  },

  // 获取家庭信息
  getFamilyInfo(familyId) {
    wx.cloud.callFunction({
      name: 'family',
      data: {
        action: 'getFamilyInfo',
        data: { familyId }
      }
    })
    .then(res => {
      if (res.result.success) {
        this.setData({ familyInfo: res.result.data })
      } else {
        // 家庭不存在，清除用户的 familyId
        const app = getApp()
        const updatedUserInfo = { 
          ...this.data.userInfo, 
          familyId: '', 
          role: '' 
        }
        
        if (app && app.globalData) {
          app.globalData.userInfo = updatedUserInfo
        }
        
        this.setData({ 
          familyInfo: {},
          userInfo: updatedUserInfo
        })
        
        // 同步更新本地存储
        wx.setStorage({
          key: 'userInfo',
          data: updatedUserInfo
        })
        
        wx.showToast({
          title: '家庭不存在或已解散',
          icon: 'none',
          duration: 2000
        })
      }
    })
    .catch(err => {
      console.error('获取家庭信息失败:', err)
    })
  },

  // 用户信息点击
  onUserInfoTap() {
    const app = getApp()
    
    // 安全检查: 确保 app 和 globalData 存在
    if (!app || !app.globalData) {
      console.error('app 或 app.globalData 未初始化')
      this.setData({ showLoginModal: true })
      return
    }
    
    if (!app.globalData.userInfo || !app.globalData.userInfo.nickname) {
      this.setData({ showLoginModal: true })
    } else {
      // 已登录，跳转到修改个人信息页面
      wx.navigateTo({
        url: '/pages/edit-profile/edit-profile'
      })
    }
  },

  // 获取用户信息
  onGetUserInfo(e) {
    const userInfo = e.detail.userInfo
    if (userInfo) {
      wx.cloud.callFunction({
        name: 'login',
        data: {
          userInfo
        }
      })
      .then(res => {
        if (res.result.success) {
          let userData = res.result.data
          
          // 处理嵌套的data字段（如果存在）
          if (userData.data && (userData.data.nickname || userData.data.avatarUrl)) {
            userData = {
              ...userData,
              nickname: userData.data.nickname || userData.nickname,
              avatarUrl: userData.data.avatarUrl || userData.avatarUrl
            }
            // 删除嵌套的data字段
            delete userData.data
          }
          
          const app = getApp()
          app.globalData.userInfo = userData
          this.setData({ 
            userInfo: userData,
            showLoginModal: false 
          })
          
          // 检查用户是否有家庭ID，如果有，获取家庭信息
          if (userData.familyId) {
            this.getFamilyInfo(userData.familyId)
          }
          
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
        } else {
          wx.showToast({
            title: '登录失败',
            icon: 'none'
          })
        }
      })
      .catch(err => {
        console.error('登录失败:', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      })
    }
  },

  // 关闭登录弹窗
  closeLoginModal() {
    this.setData({ showLoginModal: false })
  },

  // 复制邀请码
  copyInviteCode() {
    const inviteCode = this.data.familyInfo.inviteCode
    if (inviteCode) {
      wx.setClipboardData({
        data: '邀请码：' + inviteCode,
        success: () => {
          wx.showToast({
            title: '邀请码已复制',
            icon: 'success'
          })
        }
      })
    }
  },

  // 跳转到家庭管理
  goToFamilyManagement() {
    wx.navigateTo({
      url: '/pages/family-management/family-management'
    })
  },

  // 跳转到创建家庭
  goToCreateFamily() {
    wx.navigateTo({
      url: '/pages/create-family/create-family'
    })
  },

  // 跳转到加入家庭
  goToJoinFamily() {
    wx.navigateTo({
      url: '/pages/join-family/join-family'
    })
  },

  // 退出登录
  onLogoutTap() {
    const that = this
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          
          // 安全检查: 确保 app 和 globalData 存在
          if (app && app.globalData) {
            app.globalData.userInfo = null
            app.globalData.familyInfo = null
          }
          
          this.setData({ 
            userInfo: {},
            familyInfo: {}
          })
          wx.removeStorageSync('userInfo')
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
          
          // 退出后跳转到登录页
          setTimeout(() => {
            // 清空页面栈
            wx.reLaunch({
              url: '/pages/login/login'
            })
          }, 1500)
        }
      }
    })
  },

  // 关于
  onAboutTap() {
    wx.showModal({
      title: '关于暖圆小铺',
      content: '暖圆小铺是一款聚焦家庭场景的轻量工具小程序，帮助家庭记录和分享私房菜谱，留住美食时光。\n\n版本：1.0.0',
      showCancel: false
    })
  }
})