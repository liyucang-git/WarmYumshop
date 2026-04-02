// 加入家庭逻辑
Page({
  data: {
    inviteCode: '',
    loading: false
  },

  onLoad(options) {
    // 检查是否有邀请码参数
    if (options && options.inviteCode) {
      this.setData({ inviteCode: options.inviteCode })
    }
    
    // 检查用户是否已登录
    const app = getApp()
    if (!app || !app.globalData || !app.globalData.userInfo || !app.globalData.userInfo._id) {
      console.log('用户未登录，跳转到登录页')
      // 保存邀请码到全局数据
      if (options && options.inviteCode) {
        app.globalData.inviteCode = options.inviteCode
      }
      // 跳转到登录页
      wx.reLaunch({
        url: options && options.inviteCode 
          ? `/pages/login/login?inviteCode=${options.inviteCode}`
          : '/pages/login/login'
      })
    }
  },

  // 邀请码输入
  onInviteCodeInput(e) {
    this.setData({ inviteCode: e.detail.value.toUpperCase() })
  },

  // 加入家庭
  onJoin() {
    const inviteCode = this.data.inviteCode.trim()
    
    // 验证
    if (!inviteCode) {
      wx.showToast({
        title: '请输入邀请码',
        icon: 'none'
      })
      return
    }
    
    if (inviteCode.length !== 6) {
      wx.showToast({
        title: '邀请码长度应为6位',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })
    const app = getApp()
    
    // 安全检查: 确保 app 和 globalData 存在
    if (!app || !app.globalData || !app.globalData.userInfo) {
      console.error('app 或 app.globalData 未初始化')
      this.setData({ loading: false })
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }
    
    const userInfo = app.globalData.userInfo

    wx.cloud.callFunction({
      name: 'family',
      data: {
        action: 'joinFamily',
        data: {
          inviteCode,
          userId: userInfo._id
        }
      }
    })
    .then(res => {
      if (res.result.success) {
        // 更新用户信息
        app.globalData.userInfo.familyId = res.result.data._id
        app.globalData.userInfo.role = 'member'
        app.globalData.familyInfo = res.result.data
        
        // 同步更新本地存储
        wx.setStorage({
          key: 'userInfo',
          data: app.globalData.userInfo
        })
        
        wx.showToast({
          title: '加入成功',
          icon: 'success'
        })
        wx.navigateBack()
      } else {
        wx.showToast({
          title: res.result.error || '加入失败',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      console.error('加入家庭失败:', err)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    })
    .finally(() => {
      this.setData({ loading: false })
    })
  },

  // 取消
  onCancel() {
    wx.navigateBack()
  }
})