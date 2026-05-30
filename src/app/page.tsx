'use client';

import { useEffect, useState } from 'react';
import { TimerDisplay } from '@/components/timer/TimerDisplay';
import { TimerControls } from '@/components/timer/TimerControls';
import { ModeSelector } from '@/components/timer/ModeSelector';
import { TodoList } from '@/components/todo/TodoList';
import { useTimerStore } from '@/store/useTimerStore';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Timer, ListTodo } from 'lucide-react';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { initWorker, terminateWorker } = useTimerStore();

  useEffect(() => {
    setMounted(true);
    initWorker();

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
  }, [initWorker, terminateWorker]);

  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground">加载中...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center p-4 sm:p-8">
      <Tabs defaultValue="timer" className="w-full max-w-2xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Timer className="h-4 w-4" />
            番茄钟
          </TabsTrigger>
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ListTodo className="h-4 w-4" />
            任务清单
          </TabsTrigger>
        </TabsList>

        <TabsContent value="timer" className="mt-8">
          <div className="flex flex-col items-center gap-8">
            <ModeSelector />
            <TimerDisplay />
            <TimerControls />
          </div>
        </TabsContent>

        <TabsContent value="tasks" className="mt-8">
          <TodoList />
        </TabsContent>
      </Tabs>
    </div>
  );
}
