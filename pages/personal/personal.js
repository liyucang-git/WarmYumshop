// pages/personal/personal.js
const app = getApp();
const routes = require('../../constants/routes');

Page({
  data: {
    userInfo: null,
    familyInfo: null,
    isLoading: true,
    // 菜单列表
    menuItems: [
      {
        id: 'family',
        icon: 'family',
        title: '我的家庭',
        description: '查看和管理家庭信息',
        path: routes.PAGES.FAMILY_MANAGEMENT
      },
      {
        id: 'favorites',
        icon: 'favorite',
        title: '收藏夹',
        description: '查看收藏的菜品',
        path: ''
      },
      {
        id: 'history',
        icon: 'history',
        title: '历史记录',
        description: '查看最近浏览的菜品',
        path: ''
      },
      {
        id: 'settings',
        icon: 'settings',
        title: '设置',
        description: '应用设置和偏好',
        path: ''
      },
      {
        id: 'about',
        icon: 'info',
        title: '关于暖圆小铺',
        description: '版本信息和帮助',
        path: ''
      }
    ]
  },

  onLoad(options) {
    this.loadUserData();
  },

  onShow() {
    // 每次页面显示时刷新数据
    this.loadUserData(false);
  },

  // 加载用户数据
  loadUserData(showLoading = true) {
    if (showLoading) {
      wx.showLoading({ title: '加载中...' });
    }

    // 获取用户信息
    wx.getUserInfo({
      success: (res) => {
        this.setData({
          userInfo: res.userInfo,
          isLoading: false
        });
        this.loadFamilyInfo();
      },
      fail: (err) => {
        console.warn('获取用户信息失败:', err);
        this.setData({
          isLoading: false
        });
        wx.showToast({
          title: '请先登录',
          icon: 'none'
        });
      },
      complete: () => {
        if (showLoading) {
          wx.hideLoading();
        }
      }
    });
  },

  // 加载家庭信息
  loadFamilyInfo() {
    const db = wx.cloud.database();
    const userInfo = app.globalData.userInfo;
    
    if (!userInfo || !userInfo.openid) {
      return;
    }

    db.collection('families').where({
      members: db.command.elemMatch({
        openid: userInfo.openid
      })
    }).get({
      success: (res) => {
        if (res.data.length > 0) {
          this.setData({
            familyInfo: res.data[0]
          });
        } else {
          this.setData({
            familyInfo: null
          });
        }
      },
      fail: (err) => {
        console.error('加载家庭信息失败:', err);
      }
    });
  },

  // 处理菜单点击
  handleMenuItemTap(e) {
    const { id, path } = e.currentTarget.dataset;
    
    if (path) {
      wx.navigateTo({
        url: path
      });
    } else {
      this.handleMenuAction(id);
    }
  },

  // 处理菜单动作
  handleMenuAction(id) {
    switch (id) {
      case 'favorites':
        wx.showToast({
          title: '收藏夹功能开发中',
          icon: 'none'
        });
        break;
      case 'history':
        wx.showToast({
          title: '历史记录功能开发中',
          icon: 'none'
        });
        break;
      case 'settings':
        wx.showToast({
          title: '设置功能开发中',
          icon: 'none'
        });
        break;
      case 'about':
        wx.showToast({
          title: '关于功能开发中',
          icon: 'none'
        });
        break;
      default:
        break;
    }
  },

  // 编辑个人信息
  handleEditProfile() {
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    });
  },

  // 创建或加入家庭
  handleFamilyAction() {
    if (this.data.familyInfo) {
      // 已有家庭，跳转到家庭管理
      wx.navigateTo({
        url: routes.PAGES.FAMILY_MANAGEMENT
      });
    } else {
      // 没有家庭，显示选择
      wx.showActionSheet({
        itemList: ['创建家庭', '加入家庭'],
        success: (res) => {
          if (res.tapIndex === 0) {
            // 创建家庭
            wx.navigateTo({
              url: routes.PAGES.CREATE_FAMILY
            });
          } else if (res.tapIndex === 1) {
            // 加入家庭
            wx.navigateTo({
              url: routes.PAGES.JOIN_FAMILY
            });
          }
        }
      });
    }
  },

  // 分享个人中心
  onShareAppMessage() {
    return {
      title: '暖圆小铺 - 家庭私房菜谱记录',
      path: '/pages/index/index'
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    return {
      title: '暖圆小铺 - 记录家庭美食记忆',
      query: ''
    };
  }
});