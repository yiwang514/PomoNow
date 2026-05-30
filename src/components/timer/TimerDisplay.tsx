'use client';

import { useEffect, useState } from 'react';
import { useTimerStore } from '@/store/useTimerStore';

export function TimerDisplay() {
  const [mounted, setMounted] = useState(false);
  const { timeLeft, mode, status, completedPomodoros } = useTimerStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <div className="text-8xl font-bold tabular-nums tracking-tighter">
          25:00
        </div>
        <div className="text-xl text-muted-foreground">专注中</div>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const modeText = {
    focus: '专注中',
    shortBreak: '短休息',
    longBreak: '长休息',
  };

  const modeColor = {
    focus: 'text-red-500',
    shortBreak: 'text-green-500',
    longBreak: 'text-blue-500',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div
        className={`text-8xl font-bold tabular-nums tracking-tighter transition-colors duration-300 ${
          modeColor[mode]
        }`}
      >
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </div>
      <div className={`text-xl ${modeColor[mode]}`}>
        {modeText[mode]}
        {status === 'paused' && ' (已暂停)'}
      </div>
      <div className="text-sm text-muted-foreground">
        已完成 {completedPomodoros} 个番茄
      </div>
    </div>
  );
}
