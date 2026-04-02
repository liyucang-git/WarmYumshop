// 添加菜品逻辑
Page({
  data: {
    dishName: '',
    selectedCategories: [],
    dishDescription: '',
    imageUrl: '',
    categories: ['家常菜', '汤羹', '主食', '甜品', '凉菜', '热菜', '面食', '其他'],
    loading: false,
    generatingImage: false,
    isEdit: false,
    dishId: '',
    categoryWithSelection: []
  },

  // 检查分类是否被选中
  isCategorySelected(category) {
    return this.data.selectedCategories.includes(category)
  },

  onLoad(options) {
    const app = getApp()
    if (!app.checkLoginAndRedirect('pages/add-dish/add-dish', options)) {
      return
    }
    this.updateCategorySelection()
    if (options.id) {
      this.setData({ isEdit: true, dishId: options.id })
      this.getDishDetail(options.id)
    }
  },

  // 更新分类选中状态
  updateCategorySelection() {
    const { categories, selectedCategories } = this.data
    const categoryWithSelection = categories.map(cat => ({
      name: cat,
      selected: selectedCategories.indexOf(cat) >= 0
    }))
    this.setData({ categoryWithSelection })
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
        this.setData({
          dishName: dish.name,
          selectedCategories: dish.categories,
          dishDescription: dish.description,
          imageUrl: dish.imageUrl
        }, () => {
          this.updateCategorySelection()
        })
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

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePaths = res.tempFilePaths
        this.uploadImage(tempFilePaths[0])
      }
    })
  },

  // 上传图片
  uploadImage(tempFilePath) {
    this.setData({ loading: true })
    
    const cloudPath = `dishes/${Date.now()}-${Math.floor(Math.random() * 10000)}.jpg`
    
    wx.cloud.uploadFile({
      cloudPath,
      filePath: tempFilePath,
      success: (res) => {
        this.setData({ imageUrl: res.fileID, loading: false })
      },
      fail: (err) => {
        console.error('上传图片失败:', err)
        wx.showToast({
          title: '上传图片失败',
          icon: 'none'
        })
        this.setData({ loading: false })
      }
    })
  },

  // 预览图片
  previewImage() {
    wx.previewImage({
      urls: [this.data.imageUrl]
    })
  },

  // 删除图片
  removeImage() {
    this.setData({ imageUrl: '' })
  },

  // AI生成图片
  generateAIImage() {
    const { dishName } = this.data
    
    if (!dishName || !dishName.trim()) {
      wx.showToast({
        title: '请先输入菜品名称',
        icon: 'none'
      })
      return
    }

    this.setData({ generatingImage: true })

    wx.cloud.callFunction({
      name: 'generateImage-sjEjJS',
      data: {
        prompt: `一道美味的${dishName}，精致的美食摄影，高清，专业灯光，诱人的色泽`
      }
    })
    .then(res => {
      if (res.result && res.result.success && res.result.imageUrl) {
        this.setData({ 
          imageUrl: res.result.imageUrl,
          generatingImage: false 
        })
        wx.showToast({
          title: '生成成功',
          icon: 'success'
        })
      } else {
        throw new Error(res.result?.message || '生成失败')
      }
    })
    .catch(err => {
      console.error('AI生成图片失败:', err)
      wx.showToast({
        title: err.message || '生成失败，请重试',
        icon: 'none',
        duration: 2000
      })
      this.setData({ generatingImage: false })
    })
  },

  // 菜品名称输入
  onDishNameInput(e) {
    this.setData({ dishName: e.detail.value })
  },

  // 菜品描述输入
  onDishDescriptionInput(e) {
    this.setData({ dishDescription: e.detail.value })
  },

  // 切换分类
  toggleCategory(e) {
    const category = e.currentTarget.dataset.category

    let selectedCategories = [...this.data.selectedCategories]
    const index = selectedCategories.indexOf(category)

    if (index > -1) {
      selectedCategories = selectedCategories.filter(item => item !== category)
    } else {
      selectedCategories.push(category)
    }

    this.setData({ selectedCategories }, () => {
      this.updateCategorySelection()
    })
  },

  // 保存
  onSave() {
    const { dishName, selectedCategories, dishDescription, imageUrl, isEdit, dishId } = this.data
    
    // 验证
    if (!dishName.trim()) {
      wx.showToast({
        title: '请输入菜品名称',
        icon: 'none'
      })
      return
    }
    
    if (selectedCategories.length === 0) {
      wx.showToast({
        title: '请选择至少一个分类',
        icon: 'none'
      })
      return
    }
    
    if (!imageUrl) {
      wx.showToast({
        title: '请上传菜品图片',
        icon: 'none'
      })
      return
    }

    // 检查登录状态
    const app = getApp()
    
    // 安全检查: 确保 app 和 globalData 存在
    if (!app || !app.globalData) {
      console.error('app 或 app.globalData 未初始化')
      wx.showToast({
        title: '系统错误',
        icon: 'none'
      })
      return
    }
    
    if (!app.globalData.userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'none'
      })
      return
    }

    // 检查家庭状态
    if (!app.globalData.userInfo.familyId) {
      wx.showToast({
        title: '请先加入或创建家庭',
        icon: 'none'
      })
      return
    }

    this.setData({ loading: true })
    const familyId = app.globalData.userInfo.familyId

    if (isEdit) {
      // 编辑菜品
      wx.cloud.callFunction({
        name: 'dish',
        data: {
          action: 'updateDish',
          data: {
            dishId,
            name: dishName,
            categories: selectedCategories,
            description: dishDescription,
            imageUrl
          }
        }
      })
      .then(res => {
        if (res.result.success) {
          wx.showToast({
            title: '保存成功',
            icon: 'success'
          })
          wx.navigateBack()
        } else {
          wx.showToast({
            title: '保存失败',
            icon: 'none'
          })
        }
      })
      .catch(err => {
        console.error('保存失败:', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
    } else {
      // 添加菜品
      wx.cloud.callFunction({
        name: 'dish',
        data: {
          action: 'addDish',
          data: {
            name: dishName,
            categories: selectedCategories,
            description: dishDescription,
            imageUrl,
            familyId
          }
        }
      })
      .then(res => {
        if (res.result.success) {
          wx.showToast({
            title: '添加成功',
            icon: 'success'
          })
          wx.navigateBack()
        } else {
          wx.showToast({
            title: '添加失败',
            icon: 'none'
          })
        }
      })
      .catch(err => {
        console.error('添加失败:', err)
        wx.showToast({
          title: '网络错误',
          icon: 'none'
        })
      })
      .finally(() => {
        this.setData({ loading: false })
      })
    }
  },

  // 取消
  onCancel() {
    wx.navigateBack()
  }
})
