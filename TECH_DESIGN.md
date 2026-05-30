# 技术设计文档 (TDD)：高效番茄钟网站

## 1. 技术栈选择

为了实现高效开发、丝滑的用户体验以及低廉的运维成本，推荐以下技术组合：

| **视角**        | **技术选型**                     | **理由**                                                     |
| --------------- | -------------------------------- | ------------------------------------------------------------ |
| **前端框架**    | **Next.js (React) + TypeScript** | 采用 App Router 架构。提供极佳的 SEO 潜力和开箱即用的路由；TypeScript 确保代码健壮性。 |
| **样式与UI**    | **Tailwind CSS + Shadcn UI**     | Tailwind 实现原子化样式和极其简单的暗黑模式切换；Shadcn UI 提供无预设样式的、高可访问性（A11y）的组件基础。 |
| **状态管理**    | **Zustand**                      | 远比 Redux 轻量，比 React Context 性能更好，极其适合管理计时器状态，且易于做本地持久化（Middleware persist）。 |
| **后端/数据库** | **Supabase (PostgreSQL)**        | 开箱即用的 BaaS（后端即服务）。自带 JWT 用户认证、PostgreSQL 数据库、行级安全（RLS）。极大减少手写 API 的工作量。 |
| **基础设施**    | **Vercel**                       | 与 Next.js 完美集成，提供全球 CDN 加速，自动化部署，基础版完全免费。 |

## 2. 项目结构 (Project Structure)

推荐采用标准的 Next.js App Router 目录结构，保持逻辑、组件和状态的分离：

Plaintext

```
my-pomodoro-app/
├── src/
│   ├── app/                    # App Router 路由与页面
│   │   ├── layout.tsx          # 全局全局布局（Providers, Navbar）
│   │   ├── page.tsx            # 首页（番茄钟核心主页）
│   │   ├── dashboard/          # 数据统计看板页
│   │   └── api/                # 自定义后端API（如需要对接第三方）
│   ├── components/             # 可复用UI组件
│   │   ├── timer/              # 计时器相关组件（TimerDisplay, Controls）
│   │   ├── todo/               # 任务相关组件（TodoList, TaskItem）
│   │   └── ui/                 # 基础原子组件（Button, Dialog, Input）
│   ├── hooks/                  # 自定义 React Hooks (如 useWorkerTimer)
│   ├── lib/                    # 第三方库初始化（supabaseClient.ts, utils.ts）
│   ├── store/                  # Zustand 状态管理
│   │   ├── useTimerStore.ts    # 计时器状态（剩余时间、当前状态）
│   │   └── useTaskStore.ts     # 任务状态（当前选中任务、任务列表）
│   ├── types/                  # TypeScript 类型定义文件
│   └── workers/                # Web Workers 脚本（用于后台精准计时）
│       └── timer.worker.ts
├── public/                     # 静态资源（提示音音频、图标）
├── tailwind.config.js          # Tailwind 配置文件
└── tsconfig.json               # TypeScript 配置文件
```

## 3. 数据模型 (Data Model)

基于 PostgreSQL 关系型数据库设计，包含用户、设置、任务及专注记录四个核心实体。

### 3.1 `profiles` (用户扩展表)

*注：Supabase 会自动在 `auth.users` 创建用户，此处创建扩展信息表。*

- `id`: `uuid` (Primary Key, 关联 auth.users.id)
- `updated_at`: `timestamp with time zone`
- `username`: `text`

### 3.2 `user_settings` (用户偏好设置表)

- `user_id`: `uuid` (Primary Key, 外键关联 profiles.id, 级联删除)
- `focus_duration`: `integer` (默认 25，单位：分钟)
- `short_break_duration`: `integer` (默认 5)
- `long_break_duration`: `integer` (默认 15)
- `long_break_interval`: `integer` (默认 4，即多少个番茄钟后长休)
- `auto_start_breaks`: `boolean` (默认 false)
- `auto_start_focus`: `boolean` (默认 false)
- `theme`: `varchar` (默认 'system', 可选 'light', 'dark')
- `sound_effect`: `varchar` (默认 'bell')

### 3.3 `tasks` (任务表)

- `id`: `uuid` (Primary Key, 默认 `gen_random_uuid()`)
- `user_id`: `uuid` (外键，允许为 null 以支持匿名 MVP 模式)
- `title`: `text` (任务名称)
- `estimated_tomatoes`: `integer` (预计番茄数，默认 1)
- `actual_tomatoes`: `integer` (实际完成番茄数，默认 0)
- `is_completed`: `boolean` (默认 false)
- `created_at`: `timestamp with time zone` (默认 `now()`)

### 3.4 `focus_sessions` (专注流历史记录表)

- `id`: `bigint` (Primary Key, 自增)
- `user_id`: `uuid` (外键)
- `task_id`: `uuid` (外键，允许为 null，表示未绑定任务的专注)
- `session_type`: `varchar` (可选值: 'focus', 'short_break', 'long_break')
- `duration_seconds`: `integer` (实际专注秒数)
- `completed_at`: `timestamp with time zone` (默认 `now()`)

## 4. 关键技术点与解决方案

### 4.1 难点一：浏览器后台标签页休眠导致计时器变慢

> **问题：** 当用户切换到其他标签页，或者最小化浏览器时，Chrome/Edge 等浏览器为了省电，会严重限流 `setInterval`（甚至降低到每分钟执行一次），导致倒计时严重滞后。

- **解决方案：** **Web Workers + 时间戳对齐**
  1. **Web Workers：** 将计时器逻辑放入 Web Worker 中执行。Web Worker 运行在独立于主线程的后台线程中，不易受浏览器标签页休眠策略的影响。
  2. **绝对时间差校验（双保险）：** 不仅依赖 Worker 的 `tick`，每次计时器暂停/恢复，或者页面触发 `visibilitychange` 事件（从后台切回前台）时，利用 `Date.now()` 的绝对时间差来重新计算剩余时间。

TypeScript

```
// 伪代码示例：Web Worker 核心逻辑
// timer.worker.ts
let timerId: NodeJS.Timeout | null = null;

self.onmessage = (e) => {
  if (e.data === 'START') {
    timerId = setInterval(() => {
      self.postMessage('TICK');
    }, 1000);
  } else if (e.data === 'STOP') {
    if (timerId) clearInterval(timerId);
  }
};
```

### 4.2 难点二：多标签页状态同步

> **问题：** 用户可能会同时打开两个番茄钟网页。如果在一个标签页启动了倒计时，另一个标签页仍在静止，会导致数据冲突。

- **解决方案：** **BroadcastChannel API**
  - 在前端创建一个名为 `pomodoro_channel` 的广播频道。
  - 当用户在 A 标签页点击“开始”或状态发生改变时，向频道发送消息。
  - B 标签页监听该频道，接收到事件后通过 Zustand 实时同步更新本地状态，确保多窗口同步。

### 4.3 难点三：离线优先与数据乐观更新 (Optimistic UI)

> **问题：** 网络偶尔抖动时，用户点击“完成任务”如果一直转圈，会破坏“心流”体验。

- **解决方案：**
  1. **Zustand Persist：** MVP 阶段或未登录状态下，数据全部通过 Zustand 的 `persist` 中间件实时写入浏览器的 `LocalStorage`。
  2. **乐观更新：** 登录用户操作时，前端优先修改本地 Zustand 状态（UI 立即响应），同时异步向 Supabase 发起请求。如果请求失败，再捕获异常并回滚本地状态，并弹出轻提示（Toast）。

### 4.4 难点四：浏览器音频自动播放限制 (Autoplay Policy)

> **问题：** 现代浏览器禁止网页在用户没有发生交互（如点击、触摸）前自动播放声音。如果用户打开网页后什么都不点，等倒计时结束，提示音会无法播放。

- **解决方案：**
  - 在产品交互上做出引导：进入页面后的首个“开始”按钮必须由用户主动点击，此时顺便在点击事件中触发一次音频的 `audio.load()` 或者是静音播放一次。
  - 通过这一步获取浏览器的音频播放授权，后续倒计时结束时就能顺利播放提示音了。

