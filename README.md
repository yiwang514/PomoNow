<div align="center">

# 🍅 PomoNow — 专注时光

**一款温暖、禅意的番茄钟工具，帮助你进入深度工作状态**

[![Next.js](https://img.shields.io/badge/Next.js-16+-000000?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-4.0+-06B6D4?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)](LICENSE)

</div>

---

## 🌟 特性

- 🎯 **精准计时** — 使用 Web Worker 实现后台精准计时，告别浏览器标签页休眠导致的计时不准
- 🎨 **禅意设计** — 温暖的色彩搭配，呼吸动画效果，沉浸式专注体验
- 📋 **任务管理** — 创建、编辑、删除任务，预估和追踪番茄数
- ⌨️ **快捷键支持** — Space 开始/暂停，Esc 重置，高效操作
- 🌙 **暗黑模式** — 支持亮色/暗色主题切换
- 📱 **响应式布局** — 完美适配桌面端和移动端
- 💾 **本地持久化** — 数据自动保存到 LocalStorage，刷新不丢失
- 🔔 **智能提醒** — 计时结束自动提醒，支持浏览器通知

## 🚀 快速开始

### 环境要求

- Node.js 18.0 或更高版本
- npm 9.0 或更高版本

### 安装

```bash
# 克隆项目
git clone https://github.com/yiwang514/PomoNow.git

# 进入项目目录
cd PomoNow

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 即可使用。

### 构建生产版本

```bash
# 构建
npm run build

# 启动
npm start
```

## 🛠️ 技术栈

| 技术 | 说明 |
|------|------|
| **Next.js 16+** | React 全栈框架，App Router 架构 |
| **TypeScript** | 类型安全的 JavaScript 超集 |
| **Tailwind CSS 4.0** | 原子化 CSS 框架 |
| **Shadcn UI** | 高质量 React 组件库 |
| **Zustand** | 轻量级状态管理 |
| **Lucide React** | 精美的图标库 |

## 📁 项目结构

```
PomoNow/
├── src/
│   ├── app/                    # Next.js App Router 页面
│   │   ├── layout.tsx          # 全局布局
│   │   ├── page.tsx            # 首页（计时器）
│   │   ├── tasks/              # 任务管理页面
│   │   ├── stats/              # 数据统计页面
│   │   └── settings/           # 设置页面
│   ├── components/             # React 组件
│   │   ├── timer/              # 计时器组件
│   │   ├── todo/               # 任务管理组件
│   │   ├── layout/             # 布局组件
│   │   └── ui/                 # 基础 UI 组件
│   ├── store/                  # Zustand 状态管理
│   │   ├── useTimerStore.ts    # 计时器状态
│   │   └── useTaskStore.ts     # 任务状态
│   ├── types/                  # TypeScript 类型定义
│   └── workers/                # Web Workers
│       └── timer.worker.ts     # 计时器 Worker
├── public/                     # 静态资源
├── tailwind.config.js          # Tailwind 配置
└── package.json                # 项目配置
```

## ⌨️ 快捷键

| 快捷键 | 功能 |
|--------|------|
| `Space` | 开始 / 暂停计时 |
| `Esc` | 重置当前计时 |

## 🎯 核心功能

### 番茄钟计时

- 默认 25 分钟专注 + 5 分钟短休 + 15 分钟长休
- 每完成 4 个番茄钟自动触发长休
- 支持自定义时长设置
- 页面标题实时显示剩余时间

### 任务管理

- 创建任务并预估所需番茄数
- 专注时绑定当前任务
- 自动累加实际完成番茄数
- 支持标记完成和清除已完成任务

### 数据统计

- 今日完成番茄数
- 总专注时长
- 任务完成率
- 历史数据可视化（开发中）

## 🔧 配置说明

### 环境变量

项目目前无需配置环境变量，所有数据存储在浏览器本地。

### 自定义配置

在设置页面可以调整：

- 专注时长（1-60 分钟）
- 短休息时长（1-30 分钟）
- 长休息时长（1-60 分钟）
- 长休息间隔（1-10 个番茄）
- 自动开始休息/专注

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

1. Fork 本项目
2. 创建你的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交你的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [Next.js](https://nextjs.org/) - React 全栈框架
- [Tailwind CSS](https://tailwindcss.com/) - CSS 框架
- [Shadcn UI](https://ui.shadcn.com/) - 组件库
- [Lucide](https://lucide.dev/) - 图标库
- [Zustand](https://github.com/pmndrs/zustand) - 状态管理

---

<div align="center">

**如果觉得有用，请给个 ⭐ Star 支持一下！**

Made with ❤️ by [yiwang514](https://github.com/yiwang514)

</div>
