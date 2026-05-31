'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTimerStore } from '@/store/useTimerStore';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TimerControls() {
  const [mounted, setMounted] = useState(false);
  const { status, mode, startTimer, pauseTimer, resetTimer } =
    useTimerStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (status === 'running') {
          pauseTimer();
        } else {
          startTimer();
        }
      } else if (e.code === 'Escape') {
        resetTimer();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [status, startTimer, pauseTimer, resetTimer]);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-6">
        <Button
          size="lg"
          className="w-40 h-14 text-lg font-medium rounded-2xl btn-hover-lift"
        >
          <Play className="mr-2 h-5 w-5" />
          开始专注
        </Button>
      </div>
    );
  }

  const modeColors = {
    focus: 'bg-primary hover:bg-primary/90',
    shortBreak: 'bg-green-600 hover:bg-green-700',
    longBreak: 'bg-blue-600 hover:bg-blue-700',
  };

  return (
    <div className="flex items-center justify-center gap-6">
      {/* 重置按钮 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={resetTimer}
        title="重置 (Esc)"
        className="h-12 w-12 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted"
      >
        <RotateCcw className="h-5 w-5" />
      </Button>

      {/* 主按钮 */}
      <Button
        size="lg"
        className={cn(
          "w-40 h-14 text-lg font-medium rounded-2xl btn-hover-lift shadow-lg",
          modeColors[mode],
          status === 'running' && 'shadow-xl'
        )}
        onClick={() => {
          if (status === 'running') {
            pauseTimer();
          } else {
            startTimer();
          }
        }}
      >
        {status === 'running' ? (
          <>
            <Pause className="mr-2 h-5 w-5" />
            暂停
          </>
        ) : (
          <>
            <Play className="mr-2 h-5 w-5" />
            {status === 'paused' ? '继续' : '开始专注'}
          </>
        )}
      </Button>
    </div>
  );
}
