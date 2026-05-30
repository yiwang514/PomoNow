'use client';

import { useEffect, useState } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { cn } from '@/lib/utils';

export function TimerDisplay() {
  const [mounted, setMounted] = useState(false);
  const { timeLeft, mode, status, completedPomodoros, focusDuration } = useTimerStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-col items-center justify-center gap-8">
        {/* 占位符 */}
        <div className="relative w-64 h-64 sm:w-80 sm:h-80">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted/50"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-6xl sm:text-7xl font-serif font-light tracking-tighter">
              25:00
            </span>
            <span className="text-lg text-muted-foreground mt-2">专注中</span>
          </div>
        </div>
        <div className="text-sm text-muted-foreground">
          已完成 0 个番茄
        </div>
      </div>
    );
  }

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const totalSeconds = mode === 'focus' ? focusDuration * 60 : mode === 'shortBreak' ? 5 * 60 : 15 * 60;
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100;

  const modeConfig = {
    focus: {
      text: '专注中',
      color: 'var(--focus-color)',
      gradient: 'from-orange-500 to-red-500',
    },
    shortBreak: {
      text: '短休息',
      color: 'var(--break-color)',
      gradient: 'from-green-500 to-emerald-500',
    },
    longBreak: {
      text: '长休息',
      color: 'var(--long-break-color)',
      gradient: 'from-blue-500 to-cyan-500',
    },
  };

  const config = modeConfig[mode];

  return (
    <div className="flex flex-col items-center justify-center gap-8">
      {/* 主计时器环 */}
      <div className={cn("relative w-64 h-64 sm:w-80 sm:h-80", status === 'running' && 'timer-breathe')}>
        {/* 背景光晕 */}
        <div
          className="absolute inset-0 rounded-full blur-3xl opacity-20 transition-opacity duration-1000"
          style={{ background: config.color }}
        />

        {/* 进度环 */}
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          {/* 背景环 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="text-muted/30"
          />
          {/* 进度环 */}
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke={config.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${progress * 2.827} ${282.7 - progress * 2.827}`}
            className={cn("transition-all duration-1000", status === 'running' && 'progress-glow')}
          />
        </svg>

        {/* 中心内容 */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className="text-6xl sm:text-7xl font-serif font-light tracking-tighter transition-colors duration-500"
            style={{ color: config.color }}
          >
            {String(minutes).padStart(2, '0')}
            <span className="opacity-50">:</span>
            {String(seconds).padStart(2, '0')}
          </span>
          <span
            className="text-lg mt-2 transition-colors duration-500"
            style={{ color: config.color }}
          >
            {config.text}
            {status === 'paused' && ' · 已暂停'}
          </span>
        </div>
      </div>

      {/* 番茄计数 */}
      <div className="flex items-center gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-3 h-3 rounded-full transition-all duration-500",
              i < completedPomodoros % 4
                ? "scale-110"
                : "bg-muted scale-100"
            )}
            style={i < completedPomodoros % 4 ? { background: config.color } : undefined}
          />
        ))}
        <span className="text-sm text-muted-foreground ml-2">
          {completedPomodoros} 个番茄
        </span>
      </div>
    </div>
  );
}
