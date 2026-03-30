// 首页逻辑
import { getAllCategories } from '../../constants/categories.js';

// 获取应用实例
const app = getApp();

Page({
  /**
   * 页面的初始数据
   */
  data: {
    // 当前选中的分类
    activeCategory: 'all',
    // 分类列表
    categories: [],
    // 菜品列表
    dishList: [],
    // 视图模式：grid（网格）或 list（列表）
    viewMode: 'grid',
    // 排序方式：desc（最新）或 asc（最旧）
    sortOrder: 'desc',
    // 分类滚动位置
    categoryScrollLeft: 0,
    // 页面状态
    loading: false,
    refreshing: false,
    hasMore: true,
    isEmpty: false,
    // 操作菜单
    showActionSheet: false,
    actionItems: [
      { label: '编辑菜品', value: 'edit' },
      { label: '删除菜品', value: 'delete' }
    ],
    // 删除确认弹窗
    showDeleteDialog: false,
    selectedDish: null,
    selectedIndex: -1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 初始化分类
    this.initCategories();
    
    // 如果有分类参数，设置当前分类
    if (options.category) {
      this.setData({
        activeCategory: options.category
      });
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {
    // 加载菜品数据
    this.loadDishList();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 页面显示时检查数据更新
    this.checkDataUpdate();
  },

  /**
   * 初始化分类
   */
  initCategories() {
    const categories = getAllCategories();
    this.setData({
      categories: [
        { id: 'all', name: '全部' },
        ...categories
      ]
    });
  },

  /**
   * 加载菜品列表
   */
  loadDishList(refresh = false) {
    // 如果是刷新，清空列表
    const dishList = refresh ? [] : this.data.dishList;
    
    this.setData({
      loading: true,
      refreshing: refresh,
      isEmpty: false
    });

    // 模拟加载菜品数据
    setTimeout(() => {
      // 模拟菜品数据
      const mockDishes = [
        {
          _id: '1',
          name: '红烧排骨',
          categories: ['家常菜', '热菜'],
          imageUrl: '/images/dishes/红烧排骨.jpg',
          description: '这道菜是我们家的拿手菜，特别适合家庭聚餐',
          createTime: new Date('2026-03-30T14:30:00').getTime(),
          updateTime: new Date('2026-03-30T14:30:00').getTime(),
          familyId: 'family1',
          imageLoaded: false
        },
        {
          _id: '2',
          name: '番茄鸡蛋汤',
          categories: ['汤羹'],
          imageUrl: '/images/dishes/番茄鸡蛋汤.jpg',
          description: '简单又营养的家常汤',
          createTime: new Date('2026-03-29T12:15:00').getTime(),
          updateTime: new Date('2026-03-29T12:15:00').getTime(),
          familyId: 'family1',
          imageLoaded: false
        },
        {
          _id: '3',
          name: '糖醋里脊',
          categories: ['家常菜', '热菜'],
          imageUrl: '/images/dishes/糖醋里脊.jpg',
          description: '酸甜可口，大人小孩都喜欢',
          createTime: new Date('2026-03-28T18:45:00').getTime(),
          updateSize: new Date('2026-03-28T18:45:00').getTime(),
          familyId: 'family1',
          imageLoaded: false
        }
      ];

      // 根据当前分类筛选菜品
      let filteredDishes = mockDishes;
      if (this.data.activeCategory !== 'all') {
        filteredDishes = mockDishes.filter(dish =>
          dish.categories.includes(this.data.activeCategory)
        );
      }

      // 根据排序方式排序
      filteredDishes.sort((a, b) => {
        if (this.data.sortOrder === 'desc') {
          return b.createTime - a.createTime;
        } else {
          return a.createTime - b.createTime;
        }
      });

      // 合并数据
      const newDishList = refresh ? filteredDishes : [...dishList, ...filteredDishes];
      
      this.setData({
        dishList: newDishList,
        loading: false,
        refreshing: false,
        hasMore: newDishList.length < 6, // 模拟分页，假设每页最多6条
        isEmpty: newDishList.length === 0
      });
      
      // 更新页面标题
      this.updatePageTitle();
    }, 1000);
  },

  /**
   * 检查数据更新
   */
  checkDataUpdate() {
    // 这里可以添加检查数据更新的逻辑
    // 例如：检查是否有新增菜品，更新页面状态等
    
    // 模拟检查更新
    console.log('检查数据更新...');
    
    // 可以在这里调用云数据库的更新检查
    this.checkCloudDataUpdate();
  },

  /**
   * 检查云数据更新
   */
  checkCloudDataUpdate() {
    // 这里可以添加云数据库的更新检查
    // 例如：调用云函数检查数据更新
    
    console.log('检查云数据更新...');
  },

  /**
   * 更新页面标题
   */
  updatePageTitle() {
    const categoryName = this.data.activeCategory === 'all' 
      ? '全部菜品' 
      : this.data.categories.find(cat => cat.id === this.data.activeCategory)?.name;
    
    wx.setNavigationBarTitle({
      title: `暖圆小铺 - ${categoryName}`
    });
  },

  /**
   * 分类点击事件
   */
  onCategoryTap(e) {
    const category = e.currentTarget.dataset.category;
    
    this.setData({
      activeCategory: category,
      categoryScrollLeft: 0
    });
    
    // 重新加载菜品列表
    this.loadDishList(true);
    
    // 更新标题
    this.updatePageTitle();
  },

  /**
   * 切换视图模式
   */
  toggleViewMode() {
    const currentMode = this.data.viewMode;
    const newMode = currentMode === 'grid' ? 'list' : 'grid';
    
    this.setData({
      viewMode: newMode
    });
    
    wx.showToast({
      title: `已切换${newMode === 'grid' ? '网格' : '列表'}视图`,
      icon: 'none',
      duration: 1000
    });
  },

  /**
   * 切换排序方式
   */
  toggleSortOrder() {
    const currentOrder = this.data.sortOrder;
    const newOrder = currentOrder === 'desc' ? 'asc' : 'desc';
    
    this.setData({
      sortOrder: newOrder
    });
    
    wx.showToast({
      title: `已排序 - ${newOrder === 'desc' ? '最新优先' : '最旧优先'}`,
      icon: 'none',
      duration: 1000
    });
    
    // 重新排序菜品列表
    this.sortDishList();
  },

  /**
   * 排序菜品列表
   */
  sortDishList() {
    const dishList = [...this.data.dishList];
    
    dishList.sort((a, b) => {
      if (this.data.sortOrder === 'desc') {
        return b.createTime - a.createTime;
      } else {
        return a.createTime - b.createTime;
      }
    });
    
    this.setData({
      dishList
    });
  },

  /**
   * 菜品点击事件
   */
  onDishTap(e) {
    const dish = e.currentTarget.dataset.dish;
    
    // 跳转到菜品详情页
    wx.navigateTo({
      url: `/pages/dish-detail/dish-detail?_id=${dish._id}`
    });
  },

  /**
   * 菜品长按事件
   */
  onDishLongPress(e) {
    const index = e.currentTarget.dataset.index;
    const dish = this.data.dishList[index];
    
    this.setData({
      showActionSheet: true,
      selectedDish: dish,
      selectedIndex: index
    });
  },

  /**
   * 添加菜品点击事件
   */
  onAddDishTap() {
    wx.navigateTo({
      url: '/pages/add-dish/add-dish'
    });
  },

  /**
   * 操作菜单关闭事件
   */
  onActionSheetClose() {
    this.setData({
      showActionSheet: false
    });
  },

  /**
   * 操作菜单选择事件
   */
  onActionSheetSelect(e) {
    const value = e.detail.value;
    
    if (value === 'edit') {
      // 编辑菜品
      this.editDish();
    } else if (value === 'delete') {
      // 显示删除确认弹窗
      this.showDeleteDialog();
    }
    
    this.setData({
      showActionSheet: false
    });
  },

  /**
   * 编辑菜品
   */
  editDish() {
    if (!this.data.selectedDish) return;
    
    // 跳转到编辑页面
    wx.navigateTo({
      url: `/pages/add-dish/add-dish?edit=true&_id=${this.data.selectedDish._id}`
    });
  },

  /**
   * 显示删除确认弹窗
   */
  showDeleteDialog() {
    this.setData({
      showDeleteDialog: true
    });
  },

  /**
   * 确认删除
   */
  onDeleteConfirm() {
    const dishList = [...this.data.dishList];
    const selectedIndex = this.data.selectedIndex;
    
    if (selectedIndex >= 0 && selectedIndex < dishList.length) {
      // 从列表中移除菜品
      dishList.splice(selectedIndex, 1);
      
      this.setData({
        dishList,
        showDeleteDialog: false,
        selectedDish: null,
        selectedIndex: -1,
        isEmpty: dishList.length === 0
      });
      
      wx.showToast({
        title: '菜品删除成功',
        icon: 'success',
        duration: 2000
      });
      
      // 这里可以添加云数据库删除逻辑
      this.deleteFromCloud();
    }
  },

  /**
   * 删除菜品（从云数据库）
   */
  deleteFromCloud() {
    if (!this.data.selectedDish) return;
    
    // 这里可以添加云数据库删除逻辑
    // 例如：调用云函数删除菜品数据
    
    console.log('从云数据库删除菜品:', this.data.selectedDish);
  },

  /**
   * 取消删除
   */
  onDeleteCancel() {
    this.setData({
      showDeleteDialog: false,
      selectedDish: null,
      selectedIndex: -1
    });
  },

  /**
   * 图片加载错误
   */
  onImageError(e) {
    const index = e.currentTarget.dataset.index;
    const dishList = [...this.data.dishList];
    
    if (index >= 0 && index < dishList.length) {
      dishList[index].imageLoaded = false;
      dishList[index].imageError = true;
      
      this.setData({
        dishList
      });
    }
  },

  /**
   * 图片加载完成
   */
  onImageLoad(e) {
    const index = e.currentTarget.dataset.index;
    const dishList = [...this.data.dishList];
    
    if (index >= 0 && index < dishList.length) {
      dishList[index].imageLoaded = true;
      dishList[index].imageError = false;
      
      this.setData({
        dishList
      });
    }
  },

  /**
   * 下拉刷新
   */
  onRefresh() {
    this.loadDishList(true);
  },

  /**
   * 上拉加载更多
   */
  onLoadMore() {
    if (this.data.loading || !this.data.hasMore) return;
    this.loadDishList(false);
  },

  /**
   * 格式化时间
   */
  formatTime(timestamp) {
    return app.formatTime(timestamp);
  }
});