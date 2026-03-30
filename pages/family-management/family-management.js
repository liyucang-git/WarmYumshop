// pages/family-management/family-management.js
const app = getApp();

Page({
  data: {
    familyInfo: null,
    isLoading: true
  },

  onLoad(options) {
    this.loadFamilyInfo();
  },

  // 加载家庭信息
  loadFamilyInfo() {
    wx.showLoading({ title: '加载中...' });
    
    // 模拟数据
    setTimeout(() => {
      this.setData({
        familyInfo: {
          id: '1',
          name: '温馨家庭',
          code: 'WARM123',
          members: [
            { id: '1', name: '爸爸', role: '管理员' },
            { id: '2', name: '妈妈', role: '成员' },
            { id: '3', name: '小明', role: '成员' }
          ],
          createdAt: '2024-01-01',
          dishCount: 15
        },
        isLoading: false
      });
      wx.hideLoading();
    }, 1000);
  },

  // 复制家庭邀请码
  copyInviteCode() {
    if (!this.data.familyInfo) return;
    
    wx.setClipboardData({
      data: this.data.familyInfo.code,
      success: () => {
        wx.showToast({
          title: '已复制邀请码',
          icon: 'success'
        });
      }
    });
  },

  // 管理成员
  manageMembers() {
    wx.showToast({
      title: '成员管理功能开发中',
      icon: 'none'
    });
  },

  // 编辑家庭信息
  editFamilyInfo() {
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    });
  },

  // 退出家庭
  leaveFamily() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出这个家庭吗？退出后将无法查看家庭菜品。',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: '已退出家庭',
              icon: 'success'
            });
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/personal/personal'
              });
            }, 1500);
          }, 1000);
        }
      }
    });
  },

  // 解散家庭（管理员权限）
  disbandFamily() {
    wx.showModal({
      title: '确认解散',
      content: '确定要解散这个家庭吗？解散后所有数据将无法恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '处理中...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: '家庭已解散',
              icon: 'success'
            });
            setTimeout(() => {
              wx.switchTab({
                url: '/pages/personal/personal'
              });
            }, 1500);
          }, 1000);
        }
      }
    });
  }
});