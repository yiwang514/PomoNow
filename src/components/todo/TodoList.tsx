'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskItem } from './TaskItem';
import { AddTaskForm } from './AddTaskForm';

export function TodoList() {
  const [mounted, setMounted] = useState(false);
  const { tasks, clearCompleted } = useTaskStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full max-w-md mx-auto space-y-4">
        <h2 className="text-2xl font-bold text-center">任务清单</h2>
        <AddTaskForm />
        <div className="space-y-2">
          <p className="text-center text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center">任务清单</h2>

      <AddTaskForm />

      <div className="space-y-2">
        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <p className="text-center text-muted-foreground py-8">
            暂无任务，添加一个开始吧！
          </p>
        )}

        {activeTasks.map((task) => (
          <TaskItem key={task.id} task={task} />
        ))}

        {completedTasks.length > 0 && (
          <>
            <div className="flex items-center justify-between pt-4">
              <span className="text-sm text-muted-foreground">
                已完成 ({completedTasks.length})
              </span>
              <button
                onClick={clearCompleted}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                清除已完成
              </button>
            </div>
            {completedTasks.map((task) => (
              <TaskItem key={task.id} task={task} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
