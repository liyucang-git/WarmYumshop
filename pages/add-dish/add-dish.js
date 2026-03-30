// pages/add-dish/add-dish.js
const app = getApp();

Page({
  data: {
    formData: {
      name: '',
      category: '',
      description: '',
      difficulty: '简单',
      cookingTime: '',
      ingredients: [],
      steps: [],
      tips: ''
    },
    currentStep: 1, // 1: 基本信息, 2: 食材, 3: 步骤, 4: 完成
    isSubmitting: false,
    // 分类选项
    categories: [
      { value: '家常菜', label: '家常菜' },
      { value: '川菜', label: '川菜' },
      { value: '湘菜', label: '湘菜' },
      { value: '粤菜', label: '粤菜' },
      { value: '鲁菜', label: '鲁菜' },
      { value: '苏菜', label: '苏菜' },
      { value: '浙菜', label: '浙菜' },
      { value: '闽菜', label: '闽菜' },
      { value: '徽菜', label: '徽菜' },
      { value: '其他', label: '其他' }
    ],
    categoryIndex: 0, // 分类选择的索引
    difficultyIndex: 0, // 难度选择的索引
    // 难度选项
    difficulties: [
      { value: '简单', label: '简单' },
      { value: '中等', label: '中等' },
      { value: '困难', label: '困难' }
    ],
    // 临时食材
    tempIngredient: {
      name: '',
      amount: ''
    },
    // 临时步骤
    tempStep: {
      description: '',
      image: null
    }
  },

  onLoad(options) {
    // 页面初始化
  },

  // 下一步
  nextStep() {
    if (this.data.currentStep < 4) {
      this.setData({
        currentStep: this.data.currentStep + 1
      });
    }
  },

  // 临时食材输入变化
  onTempIngredientChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`tempIngredient.${field}`]: value
    });
  },

  // 临时步骤输入变化
  onTempStepChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`tempStep.${field}`]: value
    });
  },

  // 上一步
  prevStep() {
    if (this.data.currentStep > 1) {
      this.setData({
        currentStep: this.data.currentStep - 1
      });
    }
  },

  // 输入框变化
  onInputChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`formData.${field}`]: value
    });
  },

  // 选择分类
  onCategoryChange(e) {
    const index = e.detail.value;
    const category = this.data.categories[index].value;
    this.setData({
      categoryIndex: index,
      'formData.category': category
    });
  },

  // 选择难度
  onDifficultyChange(e) {
    const index = e.detail.value;
    const difficulty = this.data.difficulties[index].value;
    this.setData({
      difficultyIndex: index,
      'formData.difficulty': difficulty
    });
  },

  // 添加食材
  addIngredient() {
    const { tempIngredient } = this.data;
    if (!tempIngredient.name.trim() || !tempIngredient.amount.trim()) {
      wx.showToast({
        title: '请填写食材名称和用量',
        icon: 'none'
      });
      return;
    }

    const ingredients = [...this.data.formData.ingredients];
    ingredients.push({ ...tempIngredient });

    this.setData({
      'formData.ingredients': ingredients,
      tempIngredient: {
        name: '',
        amount: ''
      }
    });

    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
  },

  // 删除食材
  removeIngredient(e) {
    const { index } = e.currentTarget.dataset;
    const ingredients = [...this.data.formData.ingredients];
    ingredients.splice(index, 1);

    this.setData({
      'formData.ingredients': ingredients
    });
  },

  // 添加步骤
  addStep() {
    const { tempStep } = this.data;
    if (!tempStep.description.trim()) {
      wx.showToast({
        title: '请填写步骤描述',
        icon: 'none'
      });
      return;
    }

    const steps = [...this.data.formData.steps];
    steps.push({
      step: steps.length + 1,
      description: tempStep.description,
      image: tempStep.image
    });

    this.setData({
      'formData.steps': steps,
      tempStep: {
        description: '',
        image: null
      }
    });

    wx.showToast({
      title: '添加成功',
      icon: 'success'
    });
  },

  // 删除步骤
  removeStep(e) {
    const { index } = e.currentTarget.dataset;
    const steps = [...this.data.formData.steps];
    steps.splice(index, 1);

    // 重新编号步骤
    steps.forEach((step, i) => {
      step.step = i + 1;
    });

    this.setData({
      'formData.steps': steps
    });
  },

  // 选择图片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const imagePath = res.tempFilePaths[0];
        this.setData({
          'tempStep.image': imagePath
        });
      }
    });
  },

  // 提交表单
  onSubmit() {
    // 验证表单
    if (!this.validateForm()) {
      return;
    }

    this.setData({ isSubmitting: true });
    wx.showLoading({ title: '提交中...' });

    // 模拟提交
    setTimeout(() => {
      wx.hideLoading();
      wx.showToast({
        title: '菜品添加成功！',
        icon: 'success',
        duration: 2000
      });

      // 跳转回首页
      setTimeout(() => {
        wx.switchTab({
          url: '/pages/index/index'
        });
      }, 2000);
    }, 2000);
  },

  // 验证表单
  validateForm() {
    const { formData } = this.data;
    
    if (!formData.name.trim()) {
      wx.showToast({
        title: '请输入菜品名称',
        icon: 'none'
      });
      return false;
    }

    if (!formData.category) {
      wx.showToast({
        title: '请选择菜品分类',
        icon: 'none'
      });
      return false;
    }

    if (formData.ingredients.length === 0) {
      wx.showToast({
        title: '请至少添加一个食材',
        icon: 'none'
      });
      return false;
    }

    if (formData.steps.length === 0) {
      wx.showToast({
        title: '请至少添加一个烹饪步骤',
        icon: 'none'
      });
      return false;
    }

    return true;
  },

  // 重置表单
  onReset() {
    wx.showModal({
      title: '确认重置',
      content: '确定要重置所有内容吗？',
      success: (res) => {
        if (res.confirm) {
          this.setData({
            formData: {
              name: '',
              category: '',
              description: '',
              difficulty: '简单',
              cookingTime: '',
              ingredients: [],
              steps: [],
              tips: ''
            },
            currentStep: 1,
            tempIngredient: {
              name: '',
              amount: ''
            },
            tempStep: {
              description: '',
              image: null
            }
          });
        }
      }
    });
  }
});