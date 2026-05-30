import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TimerMode, TimerStatus } from '@/types';
import { SoundType } from '@/hooks/useSound';

interface TimerStore {
  // 状态
  status: TimerStatus;
  mode: TimerMode;
  timeLeft: number; // 剩余秒数
  completedPomodoros: number;

  // 设置
  focusDuration: number; // 分钟
  shortBreakDuration: number;
  longBreakDuration: number;
  longBreakInterval: number;
  autoStartBreaks: boolean;
  autoStartFocus: boolean;

  // V1.1 新增设置
  soundEffect: SoundType;
  soundEnabled: boolean;
  notificationEnabled: boolean;

  // Worker 引用
  worker: Worker | null;

  // 回调函数（用于音频和通知）
  onComplete?: () => void;

  // 操作
  setStatus: (status: TimerStatus) => void;
  setMode: (mode: TimerMode) => void;
  setTimeLeft: (timeLeft: number) => void;
  incrementPomodoros: () => void;
  resetPomodoros: () => void;

  // 设置更新
  setFocusDuration: (duration: number) => void;
  setShortBreakDuration: (duration: number) => void;
  setLongBreakDuration: (duration: number) => void;
  setLongBreakInterval: (interval: number) => void;
  setAutoStartBreaks: (auto: boolean) => void;
  setAutoStartFocus: (auto: boolean) => void;

  // V1.1 设置更新
  setSoundEffect: (sound: SoundType) => void;
  setSoundEnabled: (enabled: boolean) => void;
  setNotificationEnabled: (enabled: boolean) => void;

  // 计时器控制
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  skipTimer: () => void;

  // Worker 管理
  initWorker: () => void;
  terminateWorker: () => void;

  // 回调管理
  setOnComplete: (callback: () => void) => void;

  // 模式切换
  switchMode: (mode: TimerMode) => void;
  getNextMode: () => TimerMode;
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      // 初始状态
      status: 'idle',
      mode: 'focus',
      timeLeft: 25 * 60, // 默认 25 分钟
      completedPomodoros: 0,

      // 默认设置
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: false,
      autoStartFocus: false,

      // V1.1 默认设置
      soundEffect: 'bell',
      soundEnabled: true,
      notificationEnabled: false,

      // Worker 引用
      worker: null,

      // 回调函数
      onComplete: undefined,

      // 状态更新
      setStatus: (status) => set({ status }),
      setMode: (mode) => set({ mode }),
      setTimeLeft: (timeLeft) => set({ timeLeft }),
      incrementPomodoros: () =>
        set((state) => ({ completedPomodoros: state.completedPomodoros + 1 })),
      resetPomodoros: () => set({ completedPomodoros: 0 }),

      // 设置更新
      setFocusDuration: (duration) => {
        set({ focusDuration: duration });
        if (get().mode === 'focus' && get().status === 'idle') {
          set({ timeLeft: duration * 60 });
        }
      },
      setShortBreakDuration: (duration) => {
        set({ shortBreakDuration: duration });
        if (get().mode === 'shortBreak' && get().status === 'idle') {
          set({ timeLeft: duration * 60 });
        }
      },
      setLongBreakDuration: (duration) => {
        set({ longBreakDuration: duration });
        if (get().mode === 'longBreak' && get().status === 'idle') {
          set({ timeLeft: duration * 60 });
        }
      },
      setLongBreakInterval: (interval) => set({ longBreakInterval: interval }),
      setAutoStartBreaks: (auto) => set({ autoStartBreaks: auto }),
      setAutoStartFocus: (auto) => set({ autoStartFocus: auto }),

      // V1.1 设置更新
      setSoundEffect: (sound) => set({ soundEffect: sound }),
      setSoundEnabled: (enabled) => set({ soundEnabled: enabled }),
      setNotificationEnabled: (enabled) => set({ notificationEnabled: enabled }),

      // 计时器控制
      startTimer: () => {
        const { worker, timeLeft, status } = get();
        if (status === 'running') return;

        if (!worker) {
          get().initWorker();
        }

        set({ status: 'running' });
        get().worker?.postMessage({ type: 'START', duration: timeLeft });
      },

      pauseTimer: () => {
        const { worker } = get();
        set({ status: 'paused' });
        worker?.postMessage({ type: 'STOP' });
      },

      resetTimer: () => {
        const { worker, mode, focusDuration, shortBreakDuration, longBreakDuration } = get();
        worker?.postMessage({ type: 'STOP' });

        let defaultTime: number;
        switch (mode) {
          case 'focus':
            defaultTime = focusDuration * 60;
            break;
          case 'shortBreak':
            defaultTime = shortBreakDuration * 60;
            break;
          case 'longBreak':
            defaultTime = longBreakDuration * 60;
            break;
        }

        set({ status: 'idle', timeLeft: defaultTime });
      },

      skipTimer: () => {
        const { worker } = get();
        worker?.postMessage({ type: 'STOP' });

        const nextMode = get().getNextMode();
        get().switchMode(nextMode);
      },

      // Worker 管理
      initWorker: () => {
        if (typeof window === 'undefined') return;

        const worker = new Worker(
          new URL('../workers/timer.worker.ts', import.meta.url)
        );

        worker.onmessage = (e: MessageEvent) => {
          const { type, timeLeft } = e.data;

          switch (type) {
            case 'TICK':
              set({ timeLeft });
              // 更新页面标题
              if (typeof document !== 'undefined') {
                const { mode } = get();
                const modeText = mode === 'focus' ? '专注中' : '休息中';
                const minutes = Math.floor(timeLeft / 60);
                const seconds = timeLeft % 60;
                document.title = `(${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}) ${modeText} | 番茄钟`;
              }
              break;

            case 'COMPLETE':
              set({ status: 'idle' });
              const currentMode = get().mode;
              const { completedPomodoros } = get();

              if (currentMode === 'focus') {
                set({ completedPomodoros: completedPomodoros + 1 });
              }

              // 触发完成回调（音频和通知）
              const { onComplete } = get();
              if (onComplete) {
                onComplete();
              }

              // 自动切换到下一个模式
              const nextMode = get().getNextMode();
              get().switchMode(nextMode);

              // 自动开始下一个计时器
              if (
                (currentMode === 'focus' && get().autoStartBreaks) ||
                (currentMode !== 'focus' && get().autoStartFocus)
              ) {
                setTimeout(() => get().startTimer(), 1000);
              }
              break;

            case 'SYNC':
              set({ timeLeft });
              break;
          }
        };

        set({ worker });
      },

      terminateWorker: () => {
        const { worker } = get();
        worker?.terminate();
        set({ worker: null });
      },

      // 回调管理
      setOnComplete: (callback) => set({ onComplete: callback }),

      // 模式切换
      switchMode: (mode) => {
        const { focusDuration, shortBreakDuration, longBreakDuration } = get();
        let defaultTime: number;

        switch (mode) {
          case 'focus':
            defaultTime = focusDuration * 60;
            break;
          case 'shortBreak':
            defaultTime = shortBreakDuration * 60;
            break;
          case 'longBreak':
            defaultTime = longBreakDuration * 60;
            break;
        }

        set({ mode, timeLeft: defaultTime, status: 'idle' });
      },

      getNextMode: () => {
        const { mode, completedPomodoros, longBreakInterval } = get();

        if (mode === 'focus') {
          if ((completedPomodoros + 1) % longBreakInterval === 0) {
            return 'longBreak';
          }
          return 'shortBreak';
        }
        return 'focus';
      },
    }),
    {
      name: 'timer-storage',
      partialize: (state) => ({
        focusDuration: state.focusDuration,
        shortBreakDuration: state.shortBreakDuration,
        longBreakDuration: state.longBreakDuration,
        longBreakInterval: state.longBreakInterval,
        autoStartBreaks: state.autoStartBreaks,
        autoStartFocus: state.autoStartFocus,
        completedPomodoros: state.completedPomodoros,
        soundEffect: state.soundEffect,
        soundEnabled: state.soundEnabled,
        notificationEnabled: state.notificationEnabled,
      }),
    }
  )
);
