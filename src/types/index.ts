// 计时器状态类型
export type TimerStatus = 'idle' | 'running' | 'paused';

// 计时器模式类型
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

// 计时器状态接口
export interface TimerState {
  status: TimerStatus;
  mode: TimerMode;
  timeLeft: number; // 剩余秒数
  completedPomodoros: number; // 已完成的番茄数
  focusDuration: number; // 专注时长（分钟）
  shortBreakDuration: number; // 短休时长（分钟）
  longBreakDuration: number; // 长休时长（分钟）
  longBreakInterval: number; // 长休间隔（几个番茄后）
  autoStartBreaks: boolean; // 自动开始休息
  autoStartFocus: boolean; // 自动开始专注
}

// 任务接口
export interface Task {
  id: string;
  title: string;
  estimatedTomatoes: number; // 预估番茄数
  actualTomatoes: number; // 实际完成番茄数
  isCompleted: boolean;
  createdAt: string;
}

// 用户设置接口
export interface UserSettings {
  theme: 'light' | 'dark' | 'system';
  soundEffect: string;
}
