// pages/create-family/create-family.js
const app = getApp();

Page({
  data: {
    formData: {
      name: '',
      description: ''
    },
    isSubmitting: false
  },

  onLoad(options) {
    // 页面初始化
  },

  // 输入框变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 创建家庭
  onCreateFamily() {
    const { formData } = this.data;
    
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入家庭名称',
        icon: 'none'
      });
      return;
    }

    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '创建中...' });

    // 模拟创建过程
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '家庭创建成功！',
        icon: 'success'
      });

      // 跳转到家庭管理页面
      setTimeout(() => {
        wx.redirectTo({
          url: '/pages/family-management/family-management'
        });
      }, 1500);
    }, 2000);
  },

  // 重置表单
  onReset() {
    this.setData({
      formData: {
        name: '',
        description: ''
      }
    });
  }
});