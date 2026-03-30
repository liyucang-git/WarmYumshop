// 菜品分类常量
const CATEGORIES = [
  { id: 'homecook', name: '家常菜', color: '#FF6B35', icon: '🍲' },
  { id: 'soup', name: '汤羹', color: '#FF8C5A', icon: '🥣' },
  { id: 'staple', name: '主食', color: '#FFB38A', icon: '🍚' },
  { id: 'dessert', name: '甜品', color: '#52C41A', icon: '🍰' },
  { id: 'cold', name: '凉菜', color: '#1890FF', icon: '🥗' },
  { id: 'hot', name: '热菜', color: '#FF4D4F', icon: '🔥' },
  { id: 'noodle', name: '面食', color: '#FAAD14', icon: '🍜' },
  { id: 'other', name: '其他', color: '#999999', icon: '📝' }
];

// 分类映射
const CATEGORY_MAP = CATEGORIES.reduce((map, category) => {
  map[category.id] = category;
  return map;
}, {});

// 获取分类名称
function getCategoryName(id) {
  return CATEGORY_MAP[id]?.name || '未知分类';
}

// 获取分类颜色
function getCategoryColor(id) {
  return CATEGORY_MAP[id]?.color || '#999999';
}

// 获取分类图标
function getCategoryIcon(id) {
  return CATEGORY_MAP[id]?.icon || '📝';
}

// 获取所有分类
function getAllCategories() {
  return CATEGORIES;
}

// 获取分类选项（用于选择器）
function getCategoryOptions() {
  return CATEGORIES.map(category => ({
    value: category.id,
    label: category.name,
    color: category.color,
    icon: category.icon
  }));
}

module.exports = {
  CATEGORIES,
  CATEGORY_MAP,
  getCategoryName,
  getCategoryColor,
  getCategoryIcon,
  getAllCategories,
  getCategoryOptions
};