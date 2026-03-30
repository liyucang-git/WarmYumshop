// 页面路由配置
const ROUTES = {
  // 主页面
  PAGES: {
    INDEX: '/pages/index/index',
    PERSONAL: '/pages/personal/personal',
    
    // 菜品相关
    DISH_DETAIL: '/pages/dish-detail/dish-detail',
    ADD_DISH: '/pages/add-dish/add-dish',
    
    // 家庭相关
    FAMILY_MANAGEMENT: '/pages/family-management/family-management',
    CREATE_FAMILY: '/pages/create-family/create-family',
    JOIN_FAMILY: '/pages/join-family/join-family',
    
    // 其他页面（预留）
    SETTINGS: '/pages/settings/settings',
    ABOUT: '/pages/about/about',
    FEEDBACK: '/pages/feedback/feedback'
  }
};

// 导航到页面
function navigateTo(url, params = {}) {
  if (!url) {
    console.error('导航地址不能为空');
    return;
  }
  
  // 构建带参数的URL
  let fullUrl = url;
  const paramStr = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
    
  if (paramStr) {
    fullUrl += (fullUrl.includes('?') ? '&' : '?') + paramStr;
  }
  
  wx.navigateTo({
    url: fullUrl
  });
}

// 重定向到页面
function redirectTo(url, params = {}) {
  if (!url) {
    console.error('重定向地址不能为空');
    return;
  }
  
  // 构建带参数的URL
  let fullUrl = url;
  const paramStr = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
    
  if (paramStr) {
    fullUrl += (fullUrl.includes('?') ? '&' : '?') + paramStr;
  }
  
  wx.redirectTo({
    url: fullUrl
  });
}

// 返回上一页
function navigateBack(delta = 1) {
  wx.navigateBack({
    delta
  });
}

// 切换到Tab页面
function switchTab(url) {
  if (!url) {
    console.error('Tab地址不能为空');
    return;
  }
  
  wx.switchTab({
    url
  });
}

// 重新启动页面
function reLaunch(url, params = {}) {
  if (!url) {
    console.error('重启地址不能为空');
    return;
  }
  
  // 构建带参数的URL
  let fullUrl = url;
  const paramStr = Object.keys(params)
    .map(key => `${key}=${encodeURIComponent(params[key])}`)
    .join('&');
    
  if (paramStr) {
    fullUrl += (fullUrl.includes('?') ? '&' : '?') + paramStr;
  }
  
  wx.reLaunch({
    url: fullUrl
  });
}

// 获取当前页面路径
function getCurrentPagePath() {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  if (pages.length === 0) return '';

  const currentPage = pages[pages.length - 1];
  return currentPage.route || '';
}

// 获取当前页面实例
function getCurrentPageInstance() {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  if (pages.length === 0) return null;

  return pages[pages.length - 1];
}

// 检查是否在指定页面
function isInPage(pagePath) {
  const currentPath = getCurrentPagePath();
  return currentPath.includes(pagePath);
}

// 路由参数解析
function parseUrlParams(url) {
  const params = {};
  if (!url || !url.includes('?')) return params;
  
  const queryStr = url.split('?')[1];
  const pairs = queryStr.split('&');
  
  pairs.forEach(pair => {
    const [key, value] = pair.split('=');
    if (key && value) {
      params[decodeURIComponent(key)] = decodeURIComponent(value);
    }
  });
  
  return params;
}

module.exports = {
  ROUTES,
  navigateTo,
  redirectTo,
  navigateBack,
  switchTab,
  reLaunch,
  getCurrentPagePath,
  getCurrentPageInstance,
  isInPage,
  parseUrlParams
};