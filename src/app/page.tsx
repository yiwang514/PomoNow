'use client';

import { useEffect, useState, useCallback } from 'react';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { TimerControls } from '@/components/timer/TimerControls';
import { ModeSelector } from '@/components/timer/ModeSelector';
import { useTimerStore } from '@/store/useTimerStore';
import { useTaskStore } from '@/store/useTaskStore';
import { useSound } from '@/hooks/useSound';
import { useNotification } from '@/hooks/useNotification';
import { Zap, Target, Flag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
  const {
    initWorker,
    terminateWorker,
    completedPomodoros,
    mode,
    status,
    timeLeft,
    soundEffect,
    soundEnabled,
    notificationEnabled,
    setOnComplete,
    resetTimer,
    getNextMode,
    switchMode,
  } = useTimerStore();
  const { tasks, activeTaskId, incrementTaskTomatoes, setActiveTask } = useTaskStore();
  const { playSound, unlockAudio } = useSound();
  const { sendTimerCompleteNotification } = useNotification();

  const activeTask = tasks.find((t) => t.id === activeTaskId);
  // 判断是否正在运行（专注或休息）
  const isRunning = status === 'running';
  // 判断是否正在专注
  const isFocusing = isRunning && mode === 'focus';
  // 判断是否正在休息
  const isBreaking = isRunning && (mode === 'shortBreak' || mode === 'longBreak');

  // 处理提前完成
  const handleEarlyComplete = useCallback(() => {
    // 当专注时间大于10秒时，记录番茄（仅专注模式）
    if (mode === 'focus' && timeLeft > 10 && activeTaskId) {
      incrementTaskTomatoes(activeTaskId);
    }
    // 重置计时器
    resetTimer();
    // 如果是专注模式，清除活动任务
    if (mode === 'focus') {
      setActiveTask(null);
    }
    setShowCompleteDialog(false);
  }, [mode, timeLeft, activeTaskId, incrementTaskTomatoes, resetTimer, setActiveTask]);

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

    // 如果是专注模式完成，增加当前任务的番茄数
    if (mode === 'focus' && activeTaskId) {
      incrementTaskTomatoes(activeTaskId);
    }
  }, [
    soundEnabled,
    soundEffect,
    notificationEnabled,
    mode,
    activeTaskId,
    playSound,
    sendTimerCompleteNotification,
    incrementTaskTomatoes,
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

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      terminateWorker();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [initWorker, terminateWorker, setOnComplete, handleTimerComplete]);

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

  // 获取提前完成按钮的提示文案
  const getEarlyCompleteText = () => {
    if (mode === 'focus') return '提前完成专注';
    if (mode === 'shortBreak') return '提前结束短休息';
    return '提前结束长休息';
  };

  // 获取确认对话框的描述文案
  const getDialogDescription = () => {
    const isTimeEnough = timeLeft > 10;

    if (mode === 'focus') {
      return (
        <>
          {activeTask && (
            <>
              当前任务：<span className="font-medium text-foreground">{activeTask.title}</span>
              <br />
            </>
          )}
          {isTimeEnough ? (
            <>本次专注将被记录为一个完整的番茄钟 🍅</>
          ) : (
            <span className="text-muted-foreground">专注时间不足10秒，本次不会记录</span>
          )}
        </>
      );
    }

    // 休息模式
    return (
      <>
        {isTimeEnough ? (
          <>确定要提前结束休息吗？</>
        ) : (
          <span className="text-muted-foreground">休息时间不足10秒</span>
        )}
      </>
    );
  };

  return (
    <>
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
          {/* 当前任务提示（仅专注模式显示） */}
          {activeTask && mode === 'focus' && (
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

          {/* 控制按钮区域 */}
          <div className="flex flex-col items-center gap-4">
            <TimerControls />

            {/* 运行中显示提前完成按钮（专注和休息都显示） */}
            {isRunning && (
              <Button
                variant="outline"
                onClick={() => setShowCompleteDialog(true)}
                className={cn(
                  "rounded-xl",
                  isFocusing
                    ? "border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
                    : "border-green-300 text-green-600 hover:bg-green-50 hover:text-green-700"
                )}
              >
                <Flag className="h-4 w-4 mr-2" />
                {getEarlyCompleteText()}
              </Button>
            )}
          </div>

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

      {/* 提前完成确认对话框 */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认{isFocusing ? '提前完成' : '结束休息'}</DialogTitle>
            <DialogDescription>
              你确定要{isFocusing ? '提前完成这次专注' : '提前结束休息'}吗？
              <br />
              <br />
              {getDialogDescription()}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCompleteDialog(false)}
            >
              {isFocusing ? '继续专注' : '继续休息'}
            </Button>
            <Button
              onClick={handleEarlyComplete}
              className={isFocusing ? "bg-orange-500 hover:bg-orange-600" : "bg-green-500 hover:bg-green-600"}
            >
              <Flag className="h-4 w-4 mr-1" />
              确认{isFocusing ? '完成' : '结束'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
