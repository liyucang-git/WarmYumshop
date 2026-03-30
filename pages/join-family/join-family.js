// pages/join-family/join-family.js
const app = getApp();

Page({
  data: {
    inviteCode: '',
    isLoading: false,
    familyInfo: null
  },

  onLoad(options) {
    // 页面初始化
  },

  // 输入邀请码
  onInputChange(e) {
    this.setData({
      inviteCode: e.detail.value
    });
  },

  // 验证邀请码
  validateInviteCode() {
    const { inviteCode } = this.data;
    
    if (!inviteCode.trim()) {
      wx.showToast({
        title: '请输入邀请码',
        icon: 'none'
      });
      return false;
    }

    if (inviteCode.length !== 6) {
      wx.showToast({
        title: '邀请码应为6位字符',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 加入家庭
  onJoinFamily() {
    if (!this.validateInviteCode()) {
      return;
    }

    this.setData({ isLoading: true });
    wx.showLoading({ title: '验证中...' });

    // 模拟验证过程
    setTimeout(() => {
      wx.hideLoading();
      
      // 模拟验证成功
      this.setData({
        familyInfo: {
          name: '温馨家庭',
          code: this.data.inviteCode,
          creator: '爸爸',
          memberCount: 3
        }
      });

      wx.showModal({
        title: '验证成功',
        content: `邀请码验证成功！\n家庭名称：温馨家庭\n创建者：爸爸\n成员数量：3人`,
        success: (res) => {
          if (res.confirm) {
            wx.showLoading({ title: '加入中...' });
            
            setTimeout(() => {
              wx.hideLoading();
              wx.showToast({
                title: '加入成功！',
                icon: 'success'
              });

              // 跳转到家庭管理页面
              setTimeout(() => {
                wx.redirectTo({
                  url: '/pages/family-management/family-management'
                });
              }, 1500);
            }, 1000);
          }
        }
      });
    }, 1500);
  },

  // 扫描二维码
  scanQRCode() {
    wx.showToast({
      title: '扫码功能开发中',
      icon: 'none'
    });
  }
});