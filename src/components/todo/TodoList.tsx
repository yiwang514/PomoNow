'use client';

import { useEffect, useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { TaskItem } from './TaskItem';
import { AddTaskForm } from './AddTaskForm';
import { ListTodo, CheckCircle2 } from 'lucide-react';

export function TodoList() {
  const [mounted, setMounted] = useState(false);
  const { tasks, clearCompleted } = useTaskStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-full max-w-md mx-auto space-y-6">
        <div className="flex items-center gap-3 justify-center">
          <ListTodo className="h-6 w-6 text-primary" />
          <h2 className="text-3xl font-serif font-bold">任务清单</h2>
        </div>
        <AddTaskForm />
        <div className="space-y-3">
          <p className="text-center text-muted-foreground py-12">加载中...</p>
        </div>
      </div>
    );
  }

  const activeTasks = tasks.filter((t) => !t.isCompleted);
  const completedTasks = tasks.filter((t) => t.isCompleted);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* 标题 */}
      <div className="flex items-center gap-3 justify-center">
        <ListTodo className="h-6 w-6 text-primary" />
        <h2 className="text-3xl font-serif font-bold">任务清单</h2>
      </div>

      {/* 添加任务表单 */}
      <AddTaskForm />

      {/* 任务列表 */}
      <div className="space-y-3">
        {activeTasks.length === 0 && completedTasks.length === 0 && (
          <div className="flex flex-col items-center gap-4 py-16 text-muted-foreground">
            <ListTodo className="h-16 w-16 opacity-20" />
            <p className="text-lg">暂无任务</p>
            <p className="text-sm">添加一个任务开始专注吧！</p>
          </div>
        )}

        {/* 活跃任务 */}
        {activeTasks.map((task, index) => (
          <div
            key={task.id}
            className="animate-in fade-in slide-in-from-left-2 duration-300"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            <TaskItem task={task} />
          </div>
        ))}

        {/* 已完成任务 */}
        {completedTasks.length > 0 && (
          <>
            <div className="flex items-center justify-between pt-6 pb-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4" />
                <span>已完成 ({completedTasks.length})</span>
              </div>
              <button
                onClick={clearCompleted}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                清除全部
              </button>
            </div>
            {completedTasks.map((task, index) => (
              <div
                key={task.id}
                className="animate-in fade-in slide-in-from-left-2 duration-300"
                style={{ animationDelay: `${(activeTasks.length + index) * 50}ms` }}
              >
                <TaskItem task={task} />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
