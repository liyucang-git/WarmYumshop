// 菜品详情逻辑
Page({
  data: {
    dish: {},
    showActionSheet: false,
    showDeleteDialog: false,
    actionItems: [
      { text: '编辑', value: 'edit' },
      { text: '删除', value: 'delete' }
    ]
  },

  onLoad(options) {
    if (options.id) {
      this.getDishDetail(options.id)
    }
  },

  // 获取菜品详情
  getDishDetail(dishId) {
    wx.cloud.callFunction({
      name: 'dish',
      data: {
        action: 'getDishById',
        data: { dishId }
      }
    })
    .then(res => {
      if (res.result.success) {
        this.setData({ dish: res.result.data })
      } else {
        wx.showToast({
          title: '获取菜品详情失败',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      console.error('获取菜品详情失败:', err)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    })
  },

  // 返回
  onBack() {
    wx.navigateBack()
  },

  // 显示操作菜单
  showActionMenu() {
    this.setData({ showActionSheet: true })
  },

  // 操作菜单关闭
  onActionSheetChange(e) {
    if (!e.detail.value) {
      this.setData({ showActionSheet: false })
    }
  },

  // 编辑
  onEdit() {
    wx.navigateTo({
      url: `/pages/add-dish/add-dish?id=${this.data.dish._id}`
    })
  },

  // 删除
  onDelete() {
    this.setData({ showDeleteDialog: true })
  },

  // 确认删除
  onDeleteConfirm() {
    const dish = this.data.dish
    
    wx.cloud.callFunction({
      name: 'dish',
      data: {
        action: 'deleteDish',
        data: {
          dishId: dish._id,
          imageUrl: dish.imageUrl
        }
      }
    })
    .then(res => {
      if (res.result.success) {
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
        wx.navigateBack()
      } else {
        wx.showToast({
          title: '删除失败',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      console.error('删除失败:', err)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    })
    .finally(() => {
      this.setData({ showDeleteDialog: false })
    })
  },

  // 取消删除
  onDeleteCancel() {
    this.setData({ showDeleteDialog: false })
  },

  // 预览图片
  previewImage() {
    const imageUrl = this.data.dish.imageUrl
    if (imageUrl) {
      wx.previewImage({
        urls: [imageUrl]
      })
    }
  },

  // 格式化时间
  formatTime(time) {
    if (!time) return ''
    const date = new Date(time)
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
  },

  // 分类点击
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    // 返回首页并传递分类参数
    wx.navigateBack({
      delta: 1,
      success: () => {
        // 通知首页更新分类筛选
        const pages = getCurrentPages()
        const homePage = pages[pages.length - 2]
        if (homePage) {
          homePage.setData({ activeCategory: category })
          homePage.getDishes()
        }
      }
    })
  }
})