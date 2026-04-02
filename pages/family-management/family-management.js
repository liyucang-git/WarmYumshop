// 家庭管理逻辑
Page({
  data: {
    familyInfo: {},
    members: [],
    userRole: '',
    showConfirmDialog: false,
    confirmDialogTitle: '',
    confirmDialogContent: '',
    actionType: '',
    targetUserId: ''
  },

  onLoad() {
    this.getFamilyInfo()
    
    // 显示分享菜单
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline']
    })
  },
  
  // 自定义分享内容
  onShareAppMessage() {
    const familyName = this.data.familyInfo.name
    const inviteCode = this.data.familyInfo.inviteCode
    
    return {
      title: `邀请你加入「${familyName}」`,
      path: `/pages/join-family/join-family?inviteCode=${inviteCode}`,
      imageUrl: ''
    }
  },

  // 获取家庭信息
  getFamilyInfo() {
    const app = getApp()
    
    // 安全检查: 确保 app 和 globalData 存在
    if (!app || !app.globalData) {
      console.error('app 或 app.globalData 未初始化')
      return
    }
    
    const userInfo = app.globalData.userInfo
    
    if (userInfo && userInfo.familyId) {
      this.setData({ userRole: userInfo.role })
      
      wx.cloud.callFunction({
        name: 'family',
        data: {
          action: 'getFamilyInfo',
          data: { familyId: userInfo.familyId }
        }
      })
      .then(res => {
        if (res.result.success) {
          this.setData({ familyInfo: res.result.data })
          this.getMembersInfo(res.result.data.members)
        }
      })
      .catch(err => {
        console.error('获取家庭信息失败:', err)
      })
    }
  },

  // 获取成员信息
  getMembersInfo(members) {
    const db = wx.cloud.database()
    const usersCollection = db.collection('users')
    
    const memberPromises = members.map(member => {
      return usersCollection.doc(member.userId).get()
    })
    
    Promise.all(memberPromises)
      .then(results => {
        const membersInfo = results.map((result, index) => {
          let userData = result.data
          
          // 处理嵌套的data字段（如果存在）
          if (userData.data && (userData.data.nickname || userData.data.avatarUrl)) {
            userData = {
              ...userData,
              nickname: userData.data.nickname || userData.nickname,
              avatarUrl: userData.data.avatarUrl || userData.avatarUrl
            }
          }
          
          return {
            userId: members[index].userId,
            nickname: userData.nickname,
            avatarUrl: userData.avatarUrl,
            role: userData.role
          }
        })
        this.setData({ members: membersInfo })
      })
      .catch(err => {
        console.error('获取成员信息失败:', err)
      })
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

  // 邀请微信好友
  inviteFriend() {
    const inviteCode = this.data.familyInfo.inviteCode
    const familyName = this.data.familyInfo.name
    
    // 显示操作菜单
    wx.showActionSheet({
      itemList: ['复制邀请码', '转发给好友'],
      success: (res) => {
        if (res.tapIndex === 0) {
          // 复制邀请码
          wx.setClipboardData({
            data: inviteCode,
            success: () => {
              wx.showToast({
                title: '邀请码已复制',
                icon: 'success'
              })
            }
          })
        } else if (res.tapIndex === 1) {
          // 转发给好友 - 在真机上会触发分享
          wx.showModal({
            title: '转发给好友',
            content: `邀请好友加入「${familyName}」\n\n请按以下步骤操作：\n1. 点击右上角「···」按钮\n2. 选择「转发」\n3. 选择要邀请的好友`,
            showCancel: false,
            confirmText: '知道了'
          })
        }
      }
    })
  },

  // 移除成员
  removeMember(e) {
    const userId = e.currentTarget.dataset.userid
    this.setData({
      showConfirmDialog: true,
      confirmDialogTitle: '确认移除',
      confirmDialogContent: '确定要移除该成员吗？',
      actionType: 'remove',
      targetUserId: userId
    })
  },

  // 显示离开家庭确认
  showLeaveConfirm() {
    this.setData({
      showConfirmDialog: true,
      confirmDialogTitle: '确认离开',
      confirmDialogContent: '确定要离开家庭吗？',
      actionType: 'leave'
    })
  },

  // 显示解散家庭确认
  showDissolveConfirm() {
    this.setData({
      showConfirmDialog: true,
      confirmDialogTitle: '确认解散',
      confirmDialogContent: '确定要解散家庭吗？解散后所有成员将被移除。',
      actionType: 'dissolve'
    })
  },

  // 确认操作
  onConfirmAction() {
    const { actionType, targetUserId } = this.data
    const app = getApp()
    
    // 安全检查: 确保 app 和 globalData 存在
    if (!app || !app.globalData) {
      console.error('app 或 app.globalData 未初始化')
      return
    }
    
    const userInfo = app.globalData.userInfo

    switch (actionType) {
      case 'remove':
        this.removeMemberConfirm(targetUserId)
        break
      case 'leave':
        this.leaveFamilyConfirm()
        break
      case 'dissolve':
        this.dissolveFamilyConfirm()
        break
    }
  },

  // 取消操作
  onCancelAction() {
    this.setData({ showConfirmDialog: false })
  },

  // 确认移除成员
  removeMemberConfirm(userId) {
    const familyId = this.data.familyInfo._id
    
    wx.cloud.callFunction({
      name: 'family',
      data: {
        action: 'removeMember',
        data: { familyId, memberId: userId }
      }
    })
    .then(res => {
      if (res.result.success) {
        wx.showToast({
          title: '移除成功',
          icon: 'success'
        })
        this.getFamilyInfo()
      } else {
        wx.showToast({
          title: '移除失败',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      console.error('移除成员失败:', err)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    })
    .finally(() => {
      this.setData({ showConfirmDialog: false })
    })
  },

  // 确认离开家庭
  leaveFamilyConfirm() {
    const app = getApp()
    
    // 安全检查: 确保 app 和 globalData 存在
    if (!app || !app.globalData || !app.globalData.userInfo) {
      console.error('app 或 app.globalData.userInfo 未初始化')
      return
    }
    
    const userInfo = app.globalData.userInfo
    const familyId = userInfo.familyId
    
    wx.cloud.callFunction({
      name: 'family',
      data: {
        action: 'leaveFamily',
        data: { familyId, userId: userInfo._id }
      }
    })
    .then(res => {
      if (res.result.success) {
        // 更新用户信息
        app.globalData.userInfo.familyId = ''
        app.globalData.userInfo.role = ''
        app.globalData.familyInfo = null
        
        // 同步更新本地存储
        wx.setStorage({
          key: 'userInfo',
          data: app.globalData.userInfo
        })
        
        wx.showToast({
          title: '已离开家庭',
          icon: 'success'
        })
        wx.navigateBack()
      } else {
        wx.showToast({
          title: res.result.error || '离开失败',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      console.error('离开家庭失败:', err)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    })
    .finally(() => {
      this.setData({ showConfirmDialog: false })
    })
  },

  // 确认解散家庭
  dissolveFamilyConfirm() {
    const app = getApp()
    
    // 安全检查: 确保 app 和 globalData 存在
    if (!app || !app.globalData || !app.globalData.userInfo) {
      console.error('app 或 app.globalData.userInfo 未初始化')
      return
    }
    
    const userInfo = app.globalData.userInfo
    const familyId = userInfo.familyId
    
    wx.cloud.callFunction({
      name: 'family',
      data: {
        action: 'dissolveFamily',
        data: { familyId }
      }
    })
    .then(res => {
      if (res.result.success) {
        // 更新用户信息
        app.globalData.userInfo.familyId = ''
        app.globalData.userInfo.role = ''
        app.globalData.familyInfo = null
        
        // 同步更新本地存储
        wx.setStorage({
          key: 'userInfo',
          data: app.globalData.userInfo
        })
        
        wx.showToast({
          title: '家庭已解散',
          icon: 'success'
        })
        wx.navigateBack()
      } else {
        wx.showToast({
          title: '解散失败',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      console.error('解散家庭失败:', err)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    })
    .finally(() => {
      this.setData({ showConfirmDialog: false })
    })
  }

})