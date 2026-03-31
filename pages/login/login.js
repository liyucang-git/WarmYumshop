// 登录页逻辑
Page({
  data: {
    loading: false,
    isNavigating: false
  },

  // 页面加载
  onLoad() {
    const app = getApp()
    // 检查是否已登录
    if (app.globalData && app.globalData.userInfo) {
      // 已登录且已加入家庭，跳转到首页
      if (app.globalData.userInfo.familyId) {
        if (!this.data.isNavigating) {
          this.setData({ isNavigating: true })
          wx.switchTab({
            url: '/pages/index/index',
            fail: () => {
              this.setData({ isNavigating: false })
            }
          })
        }
      } else {
        // 已登录但未加入家庭，跳转到个人中心
        if (!this.data.isNavigating) {
          this.setData({ isNavigating: true })
          wx.switchTab({
            url: '/pages/personal/personal',
            fail: () => {
              this.setData({ isNavigating: false })
            }
          })
        }
      }
    }
  },

  // 获取用户信息
  onGetUserInfo(e) {
    const userInfo = e.detail.userInfo
    console.log('userInfo', userInfo)
    if (!userInfo) {
      wx.showToast({
        title: '需要授权才能继续使用',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })

    // 调用登录云函数
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
        
        // 保存用户信息到本地存储
        wx.setStorage({
          key: 'userInfo',
          data: res.result.data
        })
        
        // 判断是否为新用户
        if (res.result.isNewUser) {
          wx.showToast({
            title: '登录成功',
            icon: 'success'
          })
          // 新用户跳转到个人中心引导创建家庭
          setTimeout(() => {
            if (!this.data.isNavigating) {
              this.setData({ isNavigating: true })
              wx.switchTab({
                url: '/pages/personal/personal',
                fail: () => {
                  this.setData({ isNavigating: false })
                }
              })
            }
          }, 1500)
        } else {
          // 老用户
          if (res.result.data.familyId) {
            // 已加入家庭，跳转到首页
            wx.showToast({
              title: '登录成功',
              icon: 'success'
            })
            setTimeout(() => {
              if (!this.data.isNavigating) {
                this.setData({ isNavigating: true })
                wx.switchTab({
                  url: '/pages/index/index',
                  fail: () => {
                    this.setData({ isNavigating: false })
                  }
                })
              }
            }, 1500)
          } else {
            // 未加入家庭，跳转到个人中心
            wx.showToast({
              title: '登录成功',
              icon: 'success'
            })
            setTimeout(() => {
              if (!this.data.isNavigating) {
                this.setData({ isNavigating: true })
                wx.switchTab({
                  url: '/pages/personal/personal',
                  fail: () => {
                    this.setData({ isNavigating: false })
                  }
                })
              }
            }, 1500)
          }
        }
      } else {
        wx.showToast({
          title: '登录失败，请重试',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      console.error('登录失败:', err)
      console.error('错误详情:', JSON.stringify(err))
      
      let errorMsg = '登录失败，请重试'
      if (err.errMsg && err.errMsg.includes('timeout')) {
        errorMsg = '请求超时，请检查网络后重试'
      } else if (err.errMsg && err.errMsg.includes('network')) {
        errorMsg = '网络错误，请检查网络连接'
      }
      
      wx.showToast({
        title: errorMsg,
        icon: 'none',
        duration: 3000
      })
    })
    .finally(() => {
      this.setData({ loading: false })
    })
  }
})
