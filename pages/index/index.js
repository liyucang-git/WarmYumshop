// 首页逻辑
Page({
  data: {
    dishList: [],
    categories: ['家常菜', '汤羹', '主食', '甜品', '凉菜', '热菜', '面食', '其他'],
    activeCategory: 'all',
    viewMode: 'grid', // grid or list
    loading: false,
    refreshing: false,
    isEmpty: false,
    hasMore: true,
    searchQuery: '',
    categoryScrollLeft: 0,
    showActionSheet: false,
    showDeleteDialog: false,
    selectedDish: null,
    actionItems: [
      { text: '编辑', value: 'edit' },
      { text: '删除', value: 'delete' }
    ]
  },

  onLoad() {
    this.getDishes()
  },

  onShow() {
    // 页面显示时刷新数据
    this.getDishes()
  },

  // 获取菜品列表
  getDishes() {
    const app = getApp()
    
    // 安全检查: 确保 app 和 globalData 存在
    if (!app || !app.globalData) {
      console.error('app 或 app.globalData 未初始化')
      return
    }
    
    const userInfo = app.globalData.userInfo
    
    if (!userInfo || !userInfo.familyId) {
      return
    }

    this.setData({ loading: true })
    
    wx.cloud.callFunction({
      name: 'dish',
      data: {
        action: 'getDishes',
        data: {
          familyId: userInfo.familyId,
          category: this.data.activeCategory === 'all' ? '' : this.data.activeCategory,
          searchQuery: this.data.searchQuery,
          sortBy: 'latest'
        }
      }
    })
    .then(res => {
      if (res.result.success) {
        const dishes = res.result.data
        if (dishes.length > 0) {
          // 处理时间格式和分类
          dishes.forEach((dish, index) => {
            if (dish.createTime) {
              dish.formattedTime = this.formatTime(dish.createTime)
            }
            // 确保categories是数组
            if (!dish.categories || !Array.isArray(dish.categories)) {
              dish.categories = []
            }
          })
        }
        this.setData({
          dishList: dishes,
          isEmpty: dishes.length === 0,
          loading: false,
          refreshing: false
        })
      } else {
        wx.showToast({
          title: '获取菜品失败',
          icon: 'none'
        })
        this.setData({ loading: false, refreshing: false })
      }
    })
    .catch(err => {
      console.error('获取菜品失败:', err)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
      this.setData({ loading: false, refreshing: false })
    })
  },

  // 切换视图模式
  toggleViewMode() {
    this.setData({
      viewMode: this.data.viewMode === 'grid' ? 'list' : 'grid'
    })
  },

  // 分类点击
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category
    this.setData({
      activeCategory: category
    })
    this.getDishes()
  },

  // 搜索输入
  onSearchInput(e) {
    this.setData({
      searchQuery: e.detail.value
    })
    // 搜索防抖
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => {
      this.getDishes()
    }, 300)
  },

  // 下拉刷新
  onRefresh() {
    this.setData({ refreshing: true })
    this.getDishes()
  },

  // 上拉加载更多
  onLoadMore() {
    // 这里可以实现分页加载
  },

  // 菜品点击
  onDishTap(e) {
    const dish = e.currentTarget.dataset.dish
    wx.navigateTo({
      url: `/pages/dish-detail/dish-detail?id=${dish._id}`
    })
  },

  // 菜品长按
  onDishLongPress(e) {
    const dish = e.currentTarget.dataset.dish
    this.setData({
      selectedDish: dish,
      showActionSheet: true
    })
  },

  // 操作菜单关闭
  onActionSheetClose() {
    this.setData({ showActionSheet: false })
  },

  // 编辑菜品
  onEditDish() {
    this.editDish()
    this.setData({ showActionSheet: false })
  },

  // 删除菜品
  onDeleteDish() {
    this.setData({ showDeleteDialog: true })
    this.setData({ showActionSheet: false })
  },

  // 编辑菜品
  editDish() {
    wx.navigateTo({
      url: `/pages/add-dish/add-dish?id=${this.data.selectedDish._id}`
    })
  },

  // 删除菜品确认
  onDeleteConfirm() {
    const dish = this.data.selectedDish
    
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
        this.getDishes()
      } else {
        wx.showToast({
          title: '删除失败',
          icon: 'none'
        })
      }
    })
    .catch(err => {
      console.error('删除菜品失败:', err)
      wx.showToast({
        title: '网络错误',
        icon: 'none'
      })
    })
    .finally(() => {
      this.setData({ showDeleteDialog: false })
    })
  },

  // 删除取消
  onDeleteCancel() {
    this.setData({ showDeleteDialog: false })
  },

  // 添加菜品
  onAddDishTap() {
    wx.navigateTo({
      url: '/pages/add-dish/add-dish'
    })
  },

  // 图片加载错误
  onImageError(e) {
    const index = e.currentTarget.dataset.index
    const dishList = [...this.data.dishList]
    dishList[index].imageUrl = '/images/default-dish.png'
    this.setData({ dishList })
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
  }
})