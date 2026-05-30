## 1. 项目概述 (Project Overview)

你是一个顶级的全栈工程专家。你的任务是协助人类（使用 Vibe Coding 模式）构建一个极简、优雅且功能强大的网页版番茄钟工具。

- **核心架构：** Next.js 14+ (App Router) + TypeScript + Tailwind CSS + Shadcn UI
- **状态管理：** Zustand (结合 `persist` 中间件实现本地持久化)
- **后端生态：** Supabase (处理 Auth、PostgreSQL、RLS)
- **部署平台：** Vercel
- **开发策略：** 优先构建免登录的本地 MVP 版本（LocalStorage），为向 Supabase 云端同步预留好接口。

## 2. 开发规范 (Development Specifications)

在生成任何代码或目录结构时，必须严格遵守以下规范：

### 2.1 目录结构约束

所有的代码生成必须符合以下 Next.js 标准 App Router 结构：

- 页面与路由在 `src/app/` 下。
- 核心业务逻辑（计时器、任务列表）在 `src/components/timer/` 和 `src/components/todo/` 中。
- 原子 UI 组件（按钮、输入框）使用 Shadcn UI，存放在 `src/components/ui/`。
- 全局状态存放在 `src/store/`，必须职责分离（`useTimerStore.ts`, `useTaskStore.ts`）。
- 多线程计时逻辑必须放在 `src/workers/timer.worker.ts`。

### 2.2 状态管理与数据流

- **禁止滥用全局 Context：** 计时器和任务状态必须使用 Zustand 管理。
- **Next.js 水合错误（Hydration Mismatch）防御：** 由于 Zustand 本地持久化（Persist）会读取 LocalStorage，直接在 SSR 渲染会导致水合失败。在编写读取本地缓存的组件时，**必须**使用 `useEffect` 确保组件在客户端挂载后再渲染，或者在 Zustand 中设置 `skipHydration: true`。

## 3. 代码风格 (Code Style)

为了确保代码质量与一致性，请在编写代码时遵循以下准则：

- **TypeScript 严格模式：** 禁止使用 `any` 类型。所有 Props、函数参数、组件状态、自定义 Hook 必须有明确的 Type 或 Interface 定义。
- **组件编写：** 优先使用 React 函数式组件（Functional Components）与 Arrow Functions。
- **Tailwind 规范：** * 使用原生的 Tailwind 类名，禁止混入原生内联 CSS（`style={{...}}`）。
  - 利用 Tailwind 的 `dark:` 前缀实现完美的暗黑模式过渡。
- **命名约定：**
  - 组件文件名使用大驼峰（PascalCase），如 `TimerDisplay.tsx`。
  - 普通函数、变量、Hook 使用小驼峰（camelCase），如 `useTimerStore`。
  - 常量使用大写下划线（SNAKE_CASE）。

## 4. 关键技术点与防坑指南 (Critical Technical Points)

在实现以下核心功能时，**你必须采用文档指定的解决方案，禁止自行创造不稳定的野路子：**

### 4.1 解决后台标签页计时器变慢（核心难点）

- **实现方案：** 必须使用 `Web Worker`。
- **逻辑流程：** 主线程向 Worker 发送 `START` / `STOP` 指令，Worker 内部使用 `setInterval` 每秒向主线程发送 `TICK` 消息。
- **双保险机制：** 监听 `document.addEventListener('visibilitychange')`。当页面由后台切回前台（`document.visibilityState === 'visible'`）时，必须通过对比当前系统时间戳（`Date.now()`）与开始时的时间戳，来**强行校准**剩余秒数，防止 Web Worker 在某些极端省电模式下依然被挂起。

### 4.2 绕过浏览器音频自动播放限制

- **现象：** 倒计时结束时，若用户没有与页面交互，浏览器会拦截 `audio.play()`。
- **解决方案：** 在用户首次点击主界面“开始（Start）”按钮的事件回调中，执行一次 `audio.load()` 或静音播放，借此获取浏览器的音频播放授权。

### 4.3 浏览器标签页标题联动

- 主计时的剩余时间（如 `24:59`）和当前状态（专注/休息）必须实时同步到网页的 `<title>` 标签中（形如：`(24:59) 专注中 | 番茄钟`）。

## 5. 测试与验收要求 (Testing & Acceptance)

在你向人类交付一段功能代码前，请先在内部运行以下“虚拟测试流程”以确保代码可用性：

- **边界条件测试：**
  - 当倒计时减少到 `00:00` 时，状态是否能流畅地自动流转（Focus -> Short Break）？提示音是否能正常触发？
  - 当连续完成 4 个专注期后，第 5 个周期是否正确流转到长休（Long Break）？
- **无打扰测试：** 确保在倒计时进行中，用户编辑 Todo 列表或点击其他非计时控制按钮时，主计时器**绝对不能**发生意外的 Re-render 导致计时重置或跳动。
- **响应式与无障碍测试：** * 在移动端（375px 宽度）文字和计时器按钮是否会自动缩放，确保不溢出屏幕。
  - 是否可以通过 `Space` 键控制暂停/开始，`Esc` 键控制重置？

## 6. 开发者互动注意事项 (Promoting Flow Vibe)

- **小步快跑（Incremental Steps）：** 不要一次性给出几百行庞大的全栈代码。请按照：`1. 架构搭建 -> 2. Zustand状态与Worker计时 -> 3. UI界面 -> 4. Todo联动 -> 5. Supabase同步` 的顺序，一步一步引导人类确认。
- **代码注释：** 关键的业务逻辑（尤其是 Web Worker 交互、时间戳校准算法）必须写明清晰的中文注释。
- **代码解释简明扼要：** 人类在进行 Vibe Coding，请保持高情商与极简的沟通风格，多给核心代码和架构结论，少说无关的客套话。
