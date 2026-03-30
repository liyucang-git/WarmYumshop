// pages/dish-detail/dish-detail.js
const app = getApp();

Page({
  data: {
    dishId: null,
    dishInfo: null,
    isLoading: true,
    isFavorite: false,
    // 模拟数据
    mockDishInfo: {
      id: '1',
      name: '番茄炒蛋',
      description: '经典家常菜，酸甜可口，营养丰富',
      category: '家常菜',
      difficulty: '简单',
      cookingTime: '15分钟',
      ingredients: [
        { name: '番茄', amount: '2个' },
        { name: '鸡蛋', amount: '3个' },
        { name: '葱', amount: '适量' },
        { name: '盐', amount: '适量' },
        { name: '糖', amount: '1小勺' }
      ],
      steps: [
        { step: 1, description: '番茄洗净切块，鸡蛋打散备用' },
        { step: 2, description: '热锅凉油，倒入鸡蛋液炒至凝固，盛出备用' },
        { step: 3, description: '锅中留底油，放入番茄块翻炒至出汁' },
        { step: 4, description: '加入炒好的鸡蛋，加盐、糖调味，翻炒均匀' },
        { step: 5, description: '撒上葱花，翻炒几下即可出锅' }
      ],
      tips: '番茄炒蛋的关键是番茄要炒出汁，鸡蛋要炒得嫩',
      images: [
        'cloud://example-1g5q7c3c4b8a9f.6578-example-1g5q7c3c4b8a9f-1324378900/dish/1/1.jpg',
        'cloud://example-1g5q7c3c4b8a9f.6578-example-1g5q7c3c4b8a9f-1324378900/dish/1/2.jpg'
      ],
      author: {
        name: '妈妈',
        avatar: 'https://example.com/avatar.jpg'
      },
      createdAt: '2024-01-15',
      views: 123,
      favorites: 45
    }
  },

  onLoad(options) {
    const { id } = options;
    this.setData({
      dishId: id
    });
    this.loadDishInfo(id);
  },

  // 加载菜品详情
  loadDishInfo(id) {
    wx.showLoading({ title: '加载中...' });
    
    // 模拟网络请求
    setTimeout(() => {
      this.setData({
        dishInfo: this.data.mockDishInfo,
        isLoading: false
      });
      wx.hideLoading();
    }, 1000);
  },

  // 切换收藏状态
  toggleFavorite() {
    const newFavorite = !this.data.isFavorite;
    this.setData({
      isFavorite: newFavorite
    });
    
    wx.showToast({
      title: newFavorite ? '已收藏' : '已取消收藏',
      icon: 'success'
    });
  },

  // 分享菜品
  onShareAppMessage() {
    const dishInfo = this.data.dishInfo;
    return {
      title: dishInfo ? `【暖圆小铺】${dishInfo.name} - ${dishInfo.description}` : '暖圆小铺 - 家庭私房菜谱',
      path: `/pages/dish-detail/dish-detail?id=${this.data.dishId}`,
      imageUrl: dishInfo && dishInfo.images && dishInfo.images[0] ? dishInfo.images[0] : ''
    };
  },

  // 分享到朋友圈
  onShareTimeline() {
    const dishInfo = this.data.dishInfo;
    return {
      title: dishInfo ? `家庭私房菜：${dishInfo.name}` : '暖圆小铺 - 记录家庭美食',
      query: `id=${this.data.dishId}`
    };
  },

  // 编辑菜品
  handleEdit() {
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    });
  },

  // 删除菜品
  handleDelete() {
    wx.showModal({
      title: '确认删除',
      content: '确定要删除这个菜品吗？删除后无法恢复。',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '删除中...' });
          setTimeout(() => {
            wx.hideLoading();
            wx.showToast({
              title: '删除成功',
              icon: 'success'
            });
            setTimeout(() => {
              wx.navigateBack();
            }, 1500);
          }, 1000);
        }
      }
    });
  },

  // 查看大图
  previewImage(e) {
    const { index } = e.currentTarget.dataset;
    const images = this.data.dishInfo.images;
    wx.previewImage({
      current: images[index],
      urls: images
    });
  },

  // 复制食材清单
  copyIngredients() {
    const ingredients = this.data.dishInfo.ingredients;
    const text = ingredients.map(item => `${item.name}: ${item.amount}`).join('\n');
    
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  },

  // 复制步骤
  copySteps() {
    const steps = this.data.dishInfo.steps;
    const text = steps.map(item => `${item.step}. ${item.description}`).join('\n');
    
    wx.setClipboardData({
      data: text,
      success: () => {
        wx.showToast({
          title: '已复制到剪贴板',
          icon: 'success'
        });
      }
    });
  }
});