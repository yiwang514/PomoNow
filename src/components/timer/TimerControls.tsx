'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTimerStore } from '@/store/useTimerStore';
import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';

export function TimerControls() {
  const [mounted, setMounted] = useState(false);
  const { status, startTimer, pauseTimer, resetTimer, skipTimer } =
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
      <div className="flex items-center justify-center gap-4">
        <Button size="lg" className="w-32 h-12 text-lg">
          <Play className="mr-2 h-5 w-5" />
          开始
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        size="icon"
        onClick={resetTimer}
        title="重置 (Esc)"
      >
        <RotateCcw className="h-4 w-4" />
      </Button>

      <Button
        size="lg"
        className="w-32 h-12 text-lg"
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
            {status === 'paused' ? '继续' : '开始'}
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="icon"
        onClick={skipTimer}
        title="跳过"
      >
        <SkipForward className="h-4 w-4" />
      </Button>
    </div>
  );
}
