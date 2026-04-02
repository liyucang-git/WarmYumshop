// 修改个人信息逻辑
Page({
  data: {
    userInfo: {},
    loading: false
  },

  onLoad(options) {
    const app = getApp()
    if (!app.checkLoginAndRedirect('pages/edit-profile/edit-profile', options)) {
      return
    }
    this.loadUserInfo()
  },

  // 加载用户信息
  loadUserInfo() {
    const app = getApp()
    
    // 安全检查: 确保 app 和 globalData 存在
    if (!app || !app.globalData || !app.globalData.userInfo) {
      console.error('用户未登录')
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
      return
    }
    
    this.setData({ userInfo: app.globalData.userInfo })
  },

  // 选择头像
  onAvatarTap() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        this.uploadAvatar(tempFilePaths[0])
      }
    })
  },

  // 上传头像
  uploadAvatar(tempFilePath) {
    this.setData({ loading: true })
    
    // 生成唯一的文件名
    const timestamp = Date.now()
    const cloudPath = `avatars/${timestamp}.jpg`
    
    wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath,
      success: (res) => {
        const avatarUrl = res.fileID
        this.setData({
          'userInfo.avatarUrl': avatarUrl
        })
        wx.showToast({
          title: '头像上传成功',
          icon: 'success'
        })
      },
      fail: (err) => {
        console.error('上传头像失败:', err)
        wx.showToast({
          title: '上传失败，请重试',
          icon: 'none'
        })
      },
      complete: () => {
        this.setData({ loading: false })
      }
    })
  },

  // 输入用户名
  onNicknameInput(e) {
    this.setData({
      'userInfo.nickname': e.detail.value
    })
  },

  // 保存修改
  onSaveTap() {
    const { nickname, _id } = this.data.userInfo
    
    if (!nickname || nickname.trim() === '') {
      wx.showToast({
        title: '用户名不能为空',
        icon: 'none'
      })
      return
    }
    
    this.setData({ loading: true })
    
    // 调用云函数更新用户信息
    wx.cloud.callFunction({
      name: 'user',
      data: {
        action: 'updateUserInfo',
        data: {
          userId: _id,
          nickname: nickname.trim(),
          avatarUrl: this.data.userInfo.avatarUrl
        }
      }
    })
    .then(res => {
      if (res.result.success) {
        // 更新全局用户信息
        const app = getApp()
        app.globalData.userInfo = this.data.userInfo
        
        // 更新本地存储
        wx.setStorage({
          key: 'userInfo',
          data: this.data.userInfo
        })
        
        wx.showToast({
          title: '保存成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({
          title: '保存失败，请重试',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      console.error('更新用户信息失败:', err)
      wx.showToast({
        title: '网络错误，请重试',
        icon: 'none'
      })
    })
    .finally(() => {
      this.setData({ loading: false })
    })
  }
})