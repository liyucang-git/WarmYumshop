// 个人中心逻辑
Page({
  data: {
    userInfo: {},
    familyInfo: {},
    showLoginModal: false
  },

  onLoad() {
    this.getUserInfo()
  },

  onShow() {
    this.getUserInfo()
  },

  // 获取用户信息
  getUserInfo() {
    const app = getApp()
    const userInfo = app.globalData.userInfo
    
    if (userInfo) {
      this.setData({ userInfo })
      if (userInfo.familyId) {
        this.getFamilyInfo(userInfo.familyId)
      }
    } else {
      this.setData({ userInfo: {} })
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
      }
    })
    .catch(err => {
      console.error('获取家庭信息失败:', err)
    })
  },

  // 用户信息点击
  onUserInfoTap() {
    const app = getApp()
    if (!app.globalData.userInfo || !app.globalData.userInfo.nickname) {
      this.setData({ showLoginModal: true })
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
          const app = getApp()
          app.globalData.userInfo = res.result.data
          this.setData({ 
            userInfo: res.result.data,
            showLoginModal: false 
          })
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
        data: inviteCode,
        success: () => {
          wx.showToast({
            title: '复制成功',
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
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          const app = getApp()
          app.globalData.userInfo = null
          app.globalData.familyInfo = null
          this.setData({ 
            userInfo: {},
            familyInfo: {}
          })
          wx.removeStorageSync('userInfo')
          wx.showToast({
            title: '已退出登录',
            icon: 'success'
          })
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