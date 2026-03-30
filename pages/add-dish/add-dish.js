// 添加菜品逻辑
Page({
  data: {
    dishName: '',
    selectedCategories: [],
    dishDescription: '',
    imageUrl: '',
    categories: ['家常菜', '汤羹', '主食', '甜品', '凉菜', '热菜', '面食', '其他'],
    loading: false,
    isEdit: false,
    dishId: ''
  },

  onLoad(options) {
    if (options.id) {
      this.setData({ isEdit: true, dishId: options.id })
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
        const dish = res.result.data
        this.setData({
          dishName: dish.name,
          selectedCategories: dish.categories,
          dishDescription: dish.description,
          imageUrl: dish.imageUrl
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
    const selectedCategories = [...this.data.selectedCategories]
    
    const index = selectedCategories.indexOf(category)
    if (index > -1) {
      selectedCategories.splice(index, 1)
    } else {
      selectedCategories.push(category)
    }
    
    this.setData({ selectedCategories })
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