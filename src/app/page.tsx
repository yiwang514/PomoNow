'use client';

import { useEffect, useState, useCallback } from 'react';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { TimerControls } from '@/components/timer/TimerControls';
import { ModeSelector } from '@/components/timer/ModeSelector';
import { useTimerStore } from '@/store/useTimerStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useSound } from '@/hooks/useSound';
import { FocusRecord } from '@/store/useTaskStore';
import { useNotification } from '@/hooks/useNotification';
import { useBroadcastChannel } from '@/hooks/useBroadcastChannel';
import { Zap, Target } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const {
    initWorker,
    terminateWorker,
    completedPomodoros,
    mode,
    soundEffect,
    soundEnabled,
    notificationEnabled,
    setOnComplete,
  } = useTimerStore();
  const { tasks, activeTaskId, incrementTaskTomatoes, addFocusRecord } = useTaskStore();
  const { playSound, unlockAudio } = useSound();
  const { sendTimerCompleteNotification } = useNotification();
  const { sendMessage, onMessage } = useBroadcastChannel();

  const activeTask = tasks.find((t) => t.id === activeTaskId);

  // 处理计时完成
  const handleTimerComplete = useCallback(() => {
    // 播放提示音
    if (soundEnabled) {
      playSound(soundEffect);
    }

    // 发送桌面通知
    if (notificationEnabled) {
      sendTimerCompleteNotification(mode);
    }

    // 获取当前专注时长
    const focusDuration = useTimerStore.getState().focusDuration;

    // 记录专注历史
    addFocusRecord({
      taskId: activeTaskId,
      duration: focusDuration,
      type: mode,
    });

    // 如果是专注模式完成，增加当前任务的番茄数
    if (mode === 'focus' && activeTaskId) {
      incrementTaskTomatoes(activeTaskId);
    }

    // 广播同步消息
    sendMessage('TIMER_SYNC', {
      completedPomodoros: useTimerStore.getState().completedPomodoros,
      mode: useTimerStore.getState().mode,
    });
  }, [
    soundEnabled,
    soundEffect,
    notificationEnabled,
    mode,
    activeTaskId,
    playSound,
    sendTimerCompleteNotification,
    incrementTaskTomatoes,
    addFocusRecord,
    sendMessage,
  ]);

  useEffect(() => {
    setMounted(true);
    initWorker();

    // 设置完成回调
    setOnComplete(handleTimerComplete);

    // 监听页面可见性变化，同步计时器
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const worker = useTimerStore.getState().worker;
        worker?.postMessage({ type: 'SYNC' });
      }
    };

    // 监听来自其他标签页的同步消息
    const unsubscribe = onMessage('TIMER_SYNC', (message) => {
      // 可以在这里处理多标签页同步逻辑
      console.log('收到同步消息:', message);
    });

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      terminateWorker();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      unsubscribe();
    };
  }, [initWorker, terminateWorker, setOnComplete, handleTimerComplete, onMessage]);

  // 用户首次点击时解锁音频
  const handleUserInteraction = useCallback(() => {
    unlockAudio();
  }, [unlockAudio]);

  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground animate-pulse">加载中...</div>
      </div>
    );
  }

  return (
    <div
      className="flex flex-1 flex-col items-center justify-center px-4 py-12 sm:py-16"
      onClick={handleUserInteraction}
    >
      {/* 装饰性背景 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-green-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg flex flex-col items-center gap-10">
        {/* 当前任务提示 */}
        {activeTask && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-sm text-primary animate-in fade-in slide-in-from-top-2 duration-300">
            <Target className="h-4 w-4" />
            <span className="font-medium">当前任务: {activeTask.title}</span>
            <span className="text-xs opacity-75">
              ({activeTask.actualTomatoes}/{activeTask.estimatedTomatoes} 🍅)
            </span>
          </div>
        )}

        {/* 模式选择 */}
        <ModeSelector />

        {/* 计时器显示 */}
        <TimerDisplay />

        {/* 控制按钮 */}
        <TimerControls />

        {/* 统计卡片 */}
        <div className="w-full grid grid-cols-2 gap-4 mt-4">
          <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border card-hover">
            <Zap className="h-5 w-5 text-primary" />
            <span className="text-2xl font-serif font-bold">{completedPomodoros}</span>
            <span className="text-xs text-muted-foreground">今日番茄</span>
          </div>
          <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border card-hover">
            <Target className="h-5 w-5 text-green-500" />
            <span className="text-2xl font-serif font-bold">
              {tasks.filter((t) => t.isCompleted).length}
            </span>
            <span className="text-xs text-muted-foreground">完成任务</span>
          </div>
        </div>
      </div>
    </div>
  );
}
