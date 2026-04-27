# CSIT998 - 前端

## 项目概述
这是一个基于 Next.js 的现代化前端项目，使用 TypeScript 和 Tailwind CSS 构建。项目包含了用户认证、仪表盘、练习、个人资料等功能模块。

## 项目结构

```
CSIT998-frontend/
├── app/                    # 应用主目录
│   ├── auth/               # 认证相关页面
│   │   ├── login/          # 登录页面
│   │   └── signup/         # 注册页面
│   ├── dashboard/          # 仪表盘页面
│   ├── library/            # 资源库页面(订阅功能)
│   ├── practice/           # 练习页面
│   ├── profile/            # 个人资料页面
│   ├── solver/             # 解题器页面
│   └── speak/              # 语音相关页面
├── components/             # 可复用组件
│   ├── ui/                 # UI 组件库
│   └── theme-provider.tsx  # 主题提供者
├── public/                 # 静态资源
└── styles/                 # 全局样式
```

## 环境要求

- Node.js 18.0.0 或更高版本
- npm 9.0.0 或更高版本 或 pnpm 8.0.0 或更高版本

## 安装依赖

```bash
# 使用 npm
npm install

# 或者使用 pnpm (推荐)
pnpm install
```

## 开发环境

### 启动开发服务器

```bash
npm run dev
# 或者
pnpm dev
```

开发服务器将在 [http://localhost:3000](http://localhost:3000) 启动。

### 启动 Speak 语音模块

普通前端开发仍然使用 `npm run dev`。如果需要运行 `/speak` 的本地 AI 口语助手，需要同时启动 Next.js 前端和 Speak 后端：

```bash
npm run dev:speak
```

Speak 后端使用 `speak-backend/` 内的 Python 本地模型服务，首次启动会下载 Gemma 和 Kokoro 模型。运行前需要安装 `uv`：

```bash
curl -LsSf https://astral.sh/uv/install.sh | sh
```

如果只想单独启动 Speak 后端：

```bash
npm run dev:speak-backend
```

## 功能页面说明

### 1. 登录/注册页面
- **文件位置**: `app/auth/login/page.tsx` 和 `app/auth/signup/page.tsx`
- **功能**:
  - 用户登录/注册认证
  - 第三方登录集成
  - 表单验证和错误处理
  - 密码重置功能
- **修改建议**:
  - 修改认证逻辑和表单验证规则
  - 添加额外的登录方式（如微信、GitHub等）
  - 自定义登录页面的UI样式

### 2. 仪表盘
- **文件位置**: `app/dashboard/page.tsx`
- **功能**:
  - 数据概览和统计信息展示
  - 快速访问常用功能
  - 学习进度追踪
  - 最近活动记录
- **修改建议**:
  - 调整数据可视化组件
  - 添加自定义小部件
  - 优化响应式布局

### 3. 资源库页面
- **文件位置**: `app/library/page.tsx`
- **功能**:
  - 学习资源分类展示
  - 资源搜索和筛选
  - 资源上传和管理
  - 收藏和下载功能
- **修改建议**:
  - 添加新的资源分类
  - 实现高级搜索功能
  - 优化资源展示卡片
  - 集成云存储服务

### 4. 练习页面
- **文件位置**: `app/practice/page.tsx`
- **功能**:
  - 题目分类和难度筛选
  - 在线代码编辑器
  - 测试用例运行和结果验证
  - 解题记录和统计
- **修改建议**:
  - 添加新的练习题目
  - 实现代码自动补全
  - 添加更多编程语言支持
  - 优化题目解析展示

### 5. 解题器页面
- **文件位置**: `app/solver/page.tsx`
- **功能**:
  - 问题描述和输入输出说明
  - 解题思路和算法分析
  - 代码示例和优化建议
  - 相关题目推荐
- **修改建议**:
  - 添加更多算法题解
  - 实现交互式演示
  - 添加复杂度分析
  - 集成在线调试功能

### 6. 个人资料
- **文件位置**: `app/profile/page.tsx`
- **功能**:
  - 个人信息展示和编辑
  - 学习统计和成就
  - 个人设置和偏好
  - 账号安全设置
- **修改建议**:
  - 添加头像上传功能
  - 实现主题切换
  - 添加学习数据分析
  - 集成通知设置

### 7. 语音页面
- **文件位置**: `app/speak/page.tsx`
- **功能**:
  - 语音识别和评测
  - 发音练习和纠正
  - 对话模拟
  - 录音和回放
- **修改建议**:
  - 添加更多语音练习场景
  - 实现实时语音反馈
  - 集成语音识别API
  - 优化评分算法

## 技术栈

- **框架**: Next.js 14
- **语言**: TypeScript 5
- **样式**: Tailwind CSS
- **UI 组件**: Radix UI, shadcn/ui
- **状态管理**: React Hooks
- **表单处理**: React Hook Form
- **图标**: Lucide Icons
