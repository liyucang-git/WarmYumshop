// app.js
App({
  globalData: {
    userInfo: null,
    familyInfo: null,
    systemInfo: null,
    isConnected: true
  },

  onLaunch() {
    // 初始化云开发环境
    this.initCloudEnvironment();
    
    // 获取系统信息
    this.getSystemInfo();
    
    // 检查网络状态
    this.checkNetworkStatus();
    
    // 设置监听
    this.setupListeners();
  },

  // 初始化云开发环境
  initCloudEnvironment() {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力');
      return;
    }
    
    try {
      wx.cloud.init({
        env: 'cloud-1abcdef', // 你的云开发环境ID
        traceUser: true
      });
      console.log('云开发环境初始化成功');
    } catch (error) {
      console.error('云开发环境初始化失败:', error);
    }
  },

  // 获取系统信息
  getSystemInfo() {
    try {
      const systemInfo = wx.getSystemInfoSync();
      this.globalData.systemInfo = systemInfo;
      
      // 设置全局样式变量
      this.globalData.screenWidth = systemInfo.screenWidth;
      this.globalData.screenHeight = systemInfo.screenHeight;
      this.globalData.windowWidth = systemInfo.windowWidth;
      this.globalData.windowHeight = systemInfo.windowHeight;
      this.globalData.pixelRatio = systemInfo.pixelRatio;
      this.globalData.safeArea = systemInfo.safeArea;
      
      console.log('系统信息获取成功:', systemInfo);
    } catch (error) {
      console.error('获取系统信息失败:', error);
    }
  },

  // 检查网络状态
  checkNetworkStatus() {
    const networkInfo = wx.getNetworkType({
      success: (res) => {
        this.globalData.networkType = res.networkType;
        this.globalData.isConnected = res.networkType !== 'none';

        if (!this.globalData.isConnected) {
          wx.showToast({
            title: '网络连接异常',
            icon: 'none',
            duration: 2000
          });
        }
      },
      fail: (error) => {
        console.error('获取网络状态失败:', error);
        this.globalData.isConnected = false;
      }
    });
  },

  // 设置监听器
  setupListeners() {
    // 监听网络状态变化
    wx.onNetworkStatusChange((res) => {
      this.globalData.isConnected = res.isConnected;
      this.globalData.networkType = res.networkType;
      
      if (!res.isConnected) {
        wx.showToast({
          title: '网络连接已断开',

          icon: 'none',
          duration: 2000
        });
      } else {
        console.log('网络已连接，类型:', res.networkType);
      }
    });

    // 监听内存不足警告

    wx.onMemoryWarning((res) => {
      console.warn('内存不足警告:', res);
      // 可以在这里清理缓存或优化内存使用

      this.cleanupMemoryIfNeeded();
    });

    // 监听页面显示/隐藏



    wx.onAppHide(() => {
      console.log('小程序进入后台');
    });

    wx.onAppShow(() => {
      console.log('小程序进入前台');
      // 可以在这里更新数据



      this.checkUserStatus();
    });
  },

  // 清理内存

  cleanupMemoryIfNeeded() {
    // 可以在这里清理缓存图片或其他大内存对象



    console.log('执行内存清理');
  },

  // 检查用户状态


  checkUserStatus() {
    // 检查用户登录状态



    const userInfo = wx.getStorageSync('userInfo');
    const familyInfo = wx.getStorageSync('familyInfo');

    if (userInfo) {
      this.globalData.userInfo = userInfo;
    }


    if (familyInfo) {
      this.globalData.familyInfo = familyInfo;
    }

    // 如果需要，可以在这里同步用户数据



    this.syncUserDataIfNeeded();
  },

  // 同步用户数据

  syncUserDataIfNeeded() {
    // 如果有用户登录信息，可以在这里同步到云端

    if (this.globalData.userInfo) {
      console.log('用户已登录，可以同步数据');
      // 这里可以添加数据同步逻辑



    }
  },

  // 获取当前用户



  getCurrentUser() {
    return this.globalData.userInfo;
  },

  // 获取当前家庭



  getCurrentFamily() {
    return this.globalData.familyInfo;
  },

  // 设置用户信息



  setUserInfo(userInfo) {
    this.globalData.userInfo = userInfo;
    wx.setStorageSync('userInfo', userInfo);
  },

  // 设置家庭信息



  setFamilyInfo(familyInfo) {
    this.globalData.familyInfo = familyInfo;
    wx.setStorageSync('familyInfo', familyInfo);
  },

  // 检查用户是否登录


  isUserLoggedIn() {
    return !!this.globalData.userInfo;
  },

  // 检查用户是否有家庭



  isUserInFamily() {
    return !!this.globalData.familyInfo;
  },

  // 显示加载提示



  showLoading(message = '加载中') {
    wx.showLoading({
      title: message,
      mask: true
    });
  },

  // 隐藏加载提示

  hideLoading() {
    wx.hideLoading();
  },

  // 显示成功提示

  showSuccess(message) {
    wx.showToast({
      title: message,
      icon: 'success',
      duration: 2000
    });
  },

  // 显示错误提示

  showError(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 3000

    });
  },

  // 显示警告提示

  showWarning(message) {
    wx.showToast({
      title: message,
      icon: 'none',
      duration: 2500
    });
  },

  // 云开发调用封装



  callCloudFunction(name, data = {}) {
    return new Promise((resolve, reject) => {
      if (!wx.cloud) {
        reject(new Error('云开发环境未初始化'));

        return;
      }

      wx.cloud.callFunction({
        name: name,
        data: data
      }).then(res => {
        resolve(res.result);

      }).catch(error => {
        console.error(`调用云函数${name}失败:`, error);
        reject(error);

      });
    });
  },

  // 云数据库操作封装


  getCloudCollection(collectionName) {
    return wx.cloud.database().collection(collectionName);
  },

  // 格式化时间


  formatTime(timestamp, format = 'yyyy-MM-dd HH:mm') {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return format.replace('yyyy', year)
                 .replace('MM', month)
                 .replace('dd', day)
                 .replace('HH', hours)

                 .replace('mm', minutes);
  },

  // 上传图片到云存储


  uploadImageToCloud(filePath, cloudPath) {
    return new Promise((resolve, reject) => {
      if (!wx.cloud) {
        reject(new Error('云开发环境未初始化'));

        return;
      }

      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: filePath

      }).then(res => {
        resolve(res.fileID);

      }).catch(error => {
        console.error('上传图片失败:', error);
        reject(error);

      });
    });
  },

  // 清理云存储图片



  deleteCloudFile(fileID) {
    return new Promise((resolve, reject) => {
      if (!wx.cloud) {
        reject(new Error('云开发环境未初始化'));
        return;

      }

      wx.cloud.deleteFile({
        fileList: [fileID]
      }).then(res => {

        resolve(res);
      }).catch(error => {

        console.error('删除云存储文件失败:', error);
        reject(error);
      });
    });
  },

  // 检查权限


  checkPermission(scope) {
    return new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting[scope]) {
            resolve(true);

          } else {
            wx.authorize({

              scope: scope,
              success: () => {
                resolve(true);

              },
              fail: (error) => {
                console.error('授权失败:', error);
                reject(error);

              }
            });
          }
        },
        fail: (error) => {
          console.error('获取设置失败:', error);
          reject(error);

        }
      });
    });
  }
});