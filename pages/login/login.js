// 登录页逻辑
Page({
  data: {
    loading: false,
    isNavigating: false,
    showAgreementModal: false,
    agreementTitle: '',
    agreementContent: '',
    avatarUrl: '',
    nickname: '',
    canLogin: false,
    needFillInfo: false,  // 是否需要填写信息（新用户）
    hasCloudUser: false,  // 云端是否有用户记录
    cloudUserInfo: null,  // 云端用户信息
  },

  // 页面加载
  onLoad(options) {
    const app = getApp()
    
    // 保存邀请码（如果有）
    if (options && options.inviteCode) {
      this.setData({ inviteCode: options.inviteCode })
    }
    
    // 先检查本地存储中是否有用户信息
    try {
      const localUserInfo = wx.getStorageSync('userInfo')
      
      if (localUserInfo && localUserInfo._id) {
        // 有本地用户信息，更新到 globalData
        app.globalData.userInfo = localUserInfo
        
        // 已登录，跳转到对应页面
        if (localUserInfo.familyId) {
          this.navigateTo('/pages/index/index')
        } else {
          this.navigateTo('/pages/personal/personal')
        }
        return
      }
    } catch (e) {
      console.error('读取本地用户信息失败:', e)
    }
    
    // 本地没有用户信息，检查云端是否有记录
    this.checkCloudUserInfo()
  },
  
  // 检查云端是否有用户记录
  checkCloudUserInfo() {
    wx.showLoading({ title: '检查登录状态...', mask: true })
    
    wx.cloud.callFunction({
      name: 'login',
      data: {}  // 不传 userInfo，只查询
    })
    .then(res => {
      wx.hideLoading()
      console.log('检查云端用户结果:', res)
      
      const app = getApp()
      
      if (res.result.success && res.result.data && res.result.data._id) {
        // 云端有用户记录，恢复登录状态
        let userData = res.result.data
        
        // 处理可能的嵌套 data 字段
        if (userData.data && typeof userData.data === 'object') {
          userData = {
            _id: userData._id || userData.data._id,
            openid: userData.openid || userData.data.openid,
            nickname: userData.data.nickname || userData.nickname,
            avatarUrl: userData.data.avatarUrl || userData.avatarUrl,
            familyId: userData.familyId || userData.data?.familyId,
            role: userData.role || userData.data?.role,
            joinTime: userData.joinTime || userData.data?.joinTime,
            ...userData,
            ...userData.data
          }
          delete userData.data
        }
        
        console.log('恢复云端用户数据:', userData)
        
        // 保存到本地和全局
        app.globalData.userInfo = userData
        wx.setStorage({ key: 'userInfo', data: userData })
        
        // 显示一键登录（带头像昵称）
        this.setData({ 
          hasCloudUser: true,
          cloudUserInfo: {
            nickname: userData.nickname || '用户',
            avatarUrl: userData.avatarUrl || ''
          }
        })
      } else {
        // 云端没有记录，显示新用户填写界面
        this.setData({ needFillInfo: true })
      }
    })
    .catch(err => {
      wx.hideLoading()
      console.error('检查云端用户失败:', err)
      // 网络错误，显示新用户填写界面
      this.setData({ needFillInfo: true })
    })
  },
  
  // 统一跳转方法
  navigateTo(url) {
    if (!this.data.isNavigating) {
      this.setData({ isNavigating: true })
      wx.switchTab({
        url,
        fail: () => {
          this.setData({ isNavigating: false })
        }
      })
    }
  },

  // 选择头像
  onChooseAvatar(e) {
    const { avatarUrl } = e.detail
    console.log('选择的头像:', avatarUrl)
    this.setData({ 
      avatarUrl,
      tempAvatarPath: avatarUrl
    })
    this.checkCanLogin()
  },

  // 昵称输入
  onNicknameInput(e) {
    this.setData({ nickname: e.detail.value })
    this.checkCanLogin()
  },

  // 昵称输入完成
  onNicknameBlur(e) {
    const nickname = e.detail.value.trim()
    this.setData({ nickname })
    this.checkCanLogin()
  },

  // 检查是否可以登录
  checkCanLogin() {
    const { avatarUrl, nickname } = this.data
    const canLogin = avatarUrl && avatarUrl.length > 0 && nickname && nickname.trim().length > 0
    this.setData({ canLogin })
  },

  // 登录
  async onLogin() {
    const { tempAvatarPath, avatarUrl, nickname, inviteCode } = this.data
    
    if (!avatarUrl) {
      wx.showToast({ title: '请选择头像', icon: 'none' })
      return
    }
    if (!nickname || !nickname.trim()) {
      wx.showToast({ title: '请输入昵称', icon: 'none' })
      return
    }

    this.setData({ loading: true })

    let finalAvatarUrl = avatarUrl

    // 上传头像到云存储
    if (tempAvatarPath && (tempAvatarPath.startsWith('http://tmp') || tempAvatarPath.startsWith('wxfile://'))) {
      try {
        wx.showLoading({ title: '上传头像中...', mask: true })
        
        const timestamp = Date.now()
        const cloudPath = `avatars/${timestamp}.png`
        
        const uploadResult = await wx.cloud.uploadFile({
          cloudPath,
          filePath: tempAvatarPath
        })
        
        const urlResult = await wx.cloud.getTempFileURL({
          fileList: [uploadResult.fileID]
        })
        
        if (urlResult.fileList && urlResult.fileList[0] && urlResult.fileList[0].tempFileURL) {
          finalAvatarUrl = urlResult.fileList[0].tempFileURL
        }
        
        wx.hideLoading()
      } catch (uploadErr) {
        console.error('头像上传失败:', uploadErr)
        wx.hideLoading()
        wx.showToast({ title: '头像上传失败，使用默认头像', icon: 'none' })
        finalAvatarUrl = '/images/default-avatar.png'
      }
    }

    const userInfo = {
      nickName: nickname.trim(),
      avatarUrl: finalAvatarUrl
    }

    // 调用登录云函数
    wx.cloud.callFunction({
      name: 'login',
      data: { userInfo }
    })
    .then(res => {
      console.log('登录结果:', res)
      if (res.result.success) {
        // 获取用户数据，确保 _id 被正确保留
        let userData = res.result.data
        
        // 处理可能的嵌套 data 字段
        if (userData && typeof userData === 'object') {
          if (userData.data && typeof userData.data === 'object') {
            userData = {
              _id: userData._id || userData.data._id,
              openid: userData.openid || userData.data.openid,
              nickname: userData.data.nickname || userData.nickname,
              avatarUrl: userData.data.avatarUrl || userData.avatarUrl,
              familyId: userData.familyId || userData.data?.familyId,
              role: userData.role || userData.data?.role,
              joinTime: userData.joinTime || userData.data?.joinTime,
              ...userData,
              ...userData.data
            }
            delete userData.data
          }
        }
        
        console.log('处理后的用户数据:', userData)
        
        const app = getApp()
        app.globalData.userInfo = userData
        
        wx.setStorage({
          key: 'userInfo',
          data: userData
        })
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          if (!this.data.isNavigating) {
            this.setData({ isNavigating: true })
            
            if (inviteCode) {
              wx.navigateTo({
                url: `/pages/join-family/join-family?inviteCode=${inviteCode}`
              })
            } else if (userData.familyId) {
              wx.switchTab({ url: '/pages/index/index' })
            } else {
              wx.switchTab({ url: '/pages/personal/personal' })
            }
          }
        }, 1500)
      } else {
        wx.showToast({
          title: res.result.error || '登录失败，请重试',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      console.error('登录失败:', err)
      wx.showToast({ title: '登录失败，请重试', icon: 'none' })
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
      content = '用户协议内容...'
    } else if (type === 'privacy') {
      title = '隐私政策'
      content = '隐私政策内容...'
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
  },

  // 老用户一键登录
  onQuickLogin() {
    const { inviteCode } = this.data
    const app = getApp()
    
    // 从本地存储获取用户信息
    let userInfo = app.globalData.userInfo
    if (!userInfo || !userInfo._id) {
      userInfo = wx.getStorageSync('userInfo')
    }

    if (!userInfo || !userInfo._id) {
      wx.showToast({ title: '用户信息不存在，请重新注册', icon: 'none' })
      this.setData({ needFillInfo: true })
      return
    }

    this.setData({ loading: true })

    // 直接调用登录云函数，使用已保存的用户信息
    wx.cloud.callFunction({
      name: 'login',
      data: {
        userInfo: {
          nickName: userInfo?.nickname || userInfo?.nickName || '',
          avatarUrl: userInfo?.avatarUrl || ''
        }
      }
    })
    .then(res => {
      console.log('老用户登录结果:', res)
      if (res.result.success) {
        // 获取用户数据，确保 _id 被正确保留
        let userData = res.result.data
        
        // 处理可能的嵌套 data 字段
        if (userData && typeof userData === 'object') {
          // 如果有嵌套的 data，合并到顶层
          if (userData.data && typeof userData.data === 'object') {
            userData = {
              _id: userData._id || userData.data._id,
              openid: userData.openid || userData.data.openid,
              nickname: userData.data.nickname || userData.nickname || userInfo?.nickname,
              avatarUrl: userData.data.avatarUrl || userData.avatarUrl || userInfo?.avatarUrl,
              familyId: userData.familyId || userData.data?.familyId || userInfo?.familyId,
              role: userData.role || userData.data?.role || userInfo?.role,
              ...userData,
              ...userData.data
            }
            delete userData.data
          }
        }
        
        console.log('处理后的用户数据:', userData)
        
        app.globalData.userInfo = userData
        
        wx.setStorage({
          key: 'userInfo',
          data: userData
        })
        
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })
        
        setTimeout(() => {
          if (!this.data.isNavigating) {
            this.setData({ isNavigating: true })
            
            if (inviteCode) {
              wx.navigateTo({
                url: `/pages/join-family/join-family?inviteCode=${inviteCode}`
              })
            } else if (userData.familyId) {
              wx.switchTab({ url: '/pages/index/index' })
            } else {
              wx.switchTab({ url: '/pages/personal/personal' })
            }
          }
        }, 1500)
      } else {
        wx.showToast({
          title: res.result.error || '登录失败，请重试',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      console.error('老用户登录失败:', err)
      wx.showToast({ title: '登录失败，请重试', icon: 'none' })
    })
    .finally(() => {
      this.setData({ loading: false })
    })
  }
})
