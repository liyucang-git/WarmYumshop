// 创建家庭逻辑
Page({
  data: {
    familyName: '',
    loading: false
  },

  // 家庭名称输入
  onFamilyNameInput(e) {
    this.setData({ familyName: e.detail.value })
  },

  // 创建家庭
  onCreate() {
    const familyName = this.data.familyName.trim()
    
    // 验证
    if (!familyName) {
      wx.showToast({
        title: '请输入家庭名称',
        icon: 'none'
      })
      return
    }
    
    if (familyName.length < 2 || familyName.length > 20) {
      wx.showToast({
        title: '家庭名称长度应在2-20个字符之间',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })
    const app = getApp()
    
    // 安全检查: 确保 app 和 globalData 存在
    if (!app || !app.globalData) {
      console.error('app 或 app.globalData 未初始化')
      this.setData({ loading: false })
      return
    }
    
    const userInfo = app.globalData.userInfo

    // 检查登录状态
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      this.setData({ loading: false })
      return
    }

    wx.cloud.callFunction({
      name: 'family',
      data: {
        action: 'createFamily',
        data: {
          name: familyName,
          creatorId: userInfo._id
        }
      }
    })
    .then(res => {
      if (res.result.success) {
        // 更新用户信息
        app.globalData.userInfo.familyId = res.result.data._id
        app.globalData.userInfo.role = 'creator'
        app.globalData.familyInfo = res.result.data
        
        wx.showToast({
          title: '创建成功',
          icon: 'success'
        })
        wx.navigateBack()
      } else {
        wx.showToast({
          title: '创建失败',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      console.error('创建家庭失败:', err)
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