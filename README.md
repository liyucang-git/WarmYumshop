# 暖圆小铺 - 家庭私房菜谱记录微信小程序

## 📱 项目简介

暖圆小铺是一个专为家庭设计的私房菜谱记录工具，帮助家庭成员记录、分享和管理家庭美食。小程序采用温暖简洁的设计风格，以橙色系为主色调，营造温馨的家庭氛围。

## 🎯 核心功能

### 1. 菜品管理
- **菜品列表**：网格/列表两种视图展示家庭菜品
- **菜品详情**：查看菜品详细信息、食材、步骤
- **添加菜品**：多步骤表单，支持图片上传
- **编辑/删除**：管理已有菜品

### 2. 家庭管理
- **创建家庭**：建立家庭空间
- **加入家庭**：通过邀请码或二维码加入
- **家庭管理**：查看家庭信息、管理成员
- **成员管理**：查看家庭成员信息

### 3. 个人中心
- **用户信息**：查看和编辑个人信息
- **我的家庭**：快速访问家庭管理
- **收藏夹**：收藏喜欢的菜品（预留）
- **历史记录**：查看浏览记录（预留）

## 🛠️ 技术栈

- **框架**：微信原生小程序
- **UI组件库**：[TDesign 小程序组件库](https://tdesign.tencent.com/miniprogram/overview)
- **云服务**：微信云开发（数据库、存储、云函数）
- **设计系统**：自定义设计变量和工具类

## 📁 项目结构

```
/小程序/
├── app.js                 # 小程序入口，云开发初始化
├── app.json              # 全局页面配置
├── app.wxss              # 全局样式变量
├── project.config.json   # 项目配置
├── sitemap.json         # 站点地图
├── README.md            # 项目说明
├── images/              # 图片资源目录
├── constants/           # 常量配置
│   ├── categories.js    # 菜品分类常量
│   └── routes.js        # 页面路由配置
├── pages/               # 所有页面
│   ├── index/           # 首页（菜品列表）
│   ├── personal/        # 个人中心
│   ├── dish-detail/     # 菜品详情
│   ├── add-dish/        # 添加菜品
│   ├── family-management/ # 家庭管理
│   ├── create-family/   # 创建家庭
│   └── join-family/     # 加入家庭
├── components/          # 复用组件（预留）
├── utils/               # 工具函数（预留）
├── services/            # 服务层封装（预留）
└── styles/              # 样式文件
    └── common.wxss      # 通用样式
```

## 🚀 快速开始

### 1. 环境准备

1. 安装 [微信开发者工具](https://developers.weixin.qq.com/miniprogram/dev/devtools/download.html)
2. 注册微信小程序账号（如有）
3. 下载本项目代码

### 2. 项目导入

1. 打开微信开发者工具
2. 选择"导入项目"
3. 选择本项目目录
4. 填写AppID（可使用测试号）

### 3. 配置云开发

1. 在开发者工具中点击"云开发"按钮
2. 创建新的云开发环境
3. 在 `app.js` 中更新环境ID

### 4. 安装依赖

本项目使用 TDesign 小程序组件库，需要在微信开发者工具中构建npm：

```bash
# 在项目根目录执行
npm init -y
npm install tdesign-miniprogram
```

然后在微信开发者工具中：
1. 点击"工具" → "构建npm"
2. 勾选"使用npm模块"

### 5. 运行项目

1. 点击开发者工具的"编译"按钮
2. 在模拟器中查看效果
3. 扫描预览二维码在真机上测试

## 🎨 设计系统

### 色彩系统
- **主色调**：`#FF6B35`（橙色）
- **辅助色**：`#52C41A`（成功）、`#FAAD14`（警告）、`#FF4D4F`（错误）
- **文本色**：`#333333`（主）、`#666666`（次）、`#999999`（辅助）
- **背景色**：`#F8F9FA`（背景）、`#FFFFFF`（卡片）

### 字体系统
- **主要字体**：PingFang SC（微信小程序推荐）
- **字体大小**：20rpx - 42rpx 多级系统
- **行高**：1.2（紧凑）、1.5（正常）、1.75（宽松）

### 间距系统
基于 `rpx` 单位，适配不同屏幕尺寸：
- 8rpx, 16rpx, 24rpx, 32rpx, 48rpx, 64rpx

### 圆角系统
- 4rpx, 8rpx, 12rpx, 16rpx, 24rpx, 9999rpx（全圆角）

## 🔧 开发指南

### 页面开发
1. 在 `pages/` 目录下创建新页面目录
2. 创建四个文件：`.wxml`、`.wxss`、`.js`、`.json`
3. 在 `app.json` 的 `pages` 数组中添加页面路径
4. 在 `constants/routes.js` 中添加路由配置

### 组件使用
本项目集成了 TDesign 组件库，使用方法：

```xml
<!-- 在 .wxml 文件中 -->
<t-button theme="primary" bind:tap="handleTap">按钮</t-button>
```

```json
// 在页面的 .json 文件中
{
  "usingComponents": {
    "t-button": "tdesign-miniprogram/button/button"
  }
}
```

### 样式开发
- 使用 CSS 变量（`var(--color-primary)`）
- 使用工具类（`.text-primary`、`.bg-primary`）
- 响应式设计使用媒体查询

### 数据管理
- 页面数据使用 `data` 属性
- 全局数据使用 `app.globalData`
- 持久化数据使用微信云数据库

## 📱 页面说明

### 首页 (`pages/index/index`)
菜品列表页面，支持网格和列表两种视图，可按分类筛选。

### 个人中心 (`pages/personal/personal`)
用户信息管理，家庭信息展示，功能菜单入口。

### 菜品详情 (`pages/dish-detail/dish-detail`)
菜品详细信息展示，包含食材、步骤、图片等。

### 添加菜品 (`pages/add-dish/add-dish`)
多步骤表单，支持图片上传，完整的菜品信息录入。

### 家庭管理 (`pages/family-management/family-management`)
家庭信息管理，成员列表，家庭操作。

### 创建家庭 (`pages/create-family/create-family`)
创建新家庭，设置家庭名称和描述。

### 加入家庭 (`pages/join-family/join-family`)
通过邀请码或二维码加入现有家庭。

## 🚧 待开发功能

### 高优先级
1. 图片上传功能
2. 菜品搜索功能
3. 菜品分类筛选
4. 用户登录系统

### 中优先级
1. 菜品收藏功能
2. 浏览历史记录
3. 菜品分享功能
4. 家庭聊天功能

### 低优先级
1. 菜品评分系统
2. 智能推荐算法
3. 数据统计图表
4. 多语言支持

## 📄 相关文档

- [微信小程序官方文档](https://developers.weixin.qq.com/miniprogram/dev/framework/)
- [TDesign 小程序组件库](https://tdesign.tencent.com/miniprogram/overview)
- [微信云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

## 🤝 贡献指南

1. Fork 本项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系方式

如有问题或建议，请通过以下方式联系：

- 邮箱：example@example.com
- GitHub Issues：[提交问题](https://github.com/yourusername/warm-round-shop/issues)

---

**暖圆小铺** - 记录家庭美食，温暖每一餐 🍲