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

  onShow() {
    // 页面显示时重新加载数据，用于编辑后刷新
    const dishId = this.data.dish._id
    if (dishId) {
      this.getDishDetail(dishId)
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
        const dish = res.result.data
        // 处理时间格式
        if (dish.createTime) {
          dish.formattedTime = this.formatTime(dish.createTime)
        }
        // 确保categories是数组
        if (!dish.categories || !Array.isArray(dish.categories)) {
          dish.categories = []
        }
        this.setData({ dish })
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

  // 显示操作菜单
  showActionMenu() {
    this.setData({ showActionSheet: true })
  },

  // 操作菜单关闭
  onActionSheetChange(e) {
    // action-sheet 的 change 事件在点击取消或遮罩层时触发
    this.setData({ showActionSheet: false })
  },

  // 编辑
  onEdit() {
    this.setData({ showActionSheet: false })
    wx.navigateTo({
      url: `/pages/add-dish/add-dish?id=${this.data.dish._id}`
    })
  },

  // 删除
  onDelete() {
    this.setData({ showActionSheet: false })
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
    if (!time) {
      return ''
    }
    
    let date
    
    // 处理数据库返回的时间对象格式 { "$date": 时间戳 }
    if (typeof time === 'object' && time.$date) {
      date = new Date(time.$date)
    } else {
      // 处理ISO 8601格式时间字符串和其他格式
      date = new Date(time)
    }
    
    
    const result = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
    return result
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