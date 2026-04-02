// 登录页逻辑
Page({
  data: {
    loading: false,
    isNavigating: false,
    showAgreementModal: false,
    agreementTitle: '',
    agreementContent: ''
  },

  // 页面加载
  onLoad(options) {
    const app = getApp()
    
    // 保存邀请码（如果有）
    if (options && options.inviteCode) {
      this.setData({ inviteCode: options.inviteCode })
    }
    
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
        
        // 保存用户信息到本地存储
        wx.setStorage({
          key: 'userInfo',
          data: userData
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
              // 如果有邀请码，跳转到加入家庭页面
              if (this.data.inviteCode) {
                wx.navigateTo({
                  url: `/pages/join-family/join-family?inviteCode=${this.data.inviteCode}`,
                  fail: () => {
                    this.setData({ isNavigating: false })
                  }
                })
              } else {
                wx.switchTab({
                  url: '/pages/personal/personal',
                  fail: () => {
                    this.setData({ isNavigating: false })
                  }
                })
              }
            }
          }, 1500)
        } else {
          // 老用户
          if (userData.familyId) {
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
                // 如果有邀请码，跳转到加入家庭页面
                if (this.data.inviteCode) {
                  wx.navigateTo({
                    url: `/pages/join-family/join-family?inviteCode=${this.data.inviteCode}`,
                    fail: () => {
                      this.setData({ isNavigating: false })
                    }
                  })
                } else {
                  wx.switchTab({
                    url: '/pages/personal/personal',
                    fail: () => {
                      this.setData({ isNavigating: false })
                    }
                  })
                }
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
  },

  // 打开协议弹窗
  onAgreementTap(e) {
    const type = e.currentTarget.dataset.type
    let title = ''
    let content = ''

    if (type === 'user') {
      title = '用户协议'
      content = `用户协议\n\n1. 欢迎使用暖圆小铺！本协议是您与暖圆小铺之间的法律协议。\n\n2. 您在使用暖圆小铺服务前，应当仔细阅读并理解本协议的全部内容。\n\n3. 您通过登录、使用暖圆小铺服务，即表示您同意受本协议的约束。\n\n4. 暖圆小铺保留随时修改本协议的权利，修改后的协议将在应用内公布。\n\n5. 您应当妥善保管您的账号和密码，对您的账号下的所有行为负责。\n\n6. 您在使用暖圆小铺服务时，应当遵守法律法规，不得利用服务从事违法活动。\n\n7. 暖圆小铺有权在必要时终止向您提供服务，如您违反本协议的规定。\n\n8. 本协议的最终解释权归暖圆小铺所有。`
    } else if (type === 'privacy') {
      title = '隐私政策'
      content = `隐私政策\n\n1. 暖圆小铺重视您的隐私保护，我们将按照本政策处理您的个人信息。\n\n2. 我们收集的信息包括：您的微信昵称、头像、openid等。\n\n3. 我们收集信息的目的是为了提供更好的服务，如识别用户身份、个性化推荐等。\n\n4. 我们不会向第三方分享您的个人信息，除非得到您的明确授权或法律法规要求。\n\n5. 我们会采取合理的安全措施保护您的个人信息，防止信息泄露。\n\n6. 您有权访问、修改或删除您的个人信息，如您需要，请联系我们。\n\n7. 本隐私政策可能会不时更新，更新后的政策将在应用内公布。\n\n8. 如您对本隐私政策有任何疑问，请联系我们。`
    }

    this.setData({
      showAgreementModal: true,
      agreementTitle: title,
      agreementContent: content
    })
  },

  // 关闭协议弹窗
  onCloseModal() {
    this.setData({
      showAgreementModal: false
    })
  }
})
