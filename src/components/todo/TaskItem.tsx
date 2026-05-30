'use client';

import { Task } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, Circle, Zap } from 'lucide-react';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { removeTask, toggleTask, setActiveTask, activeTaskId } =
    useTaskStore();

  const isActive = activeTaskId === task.id;

  return (
    <div
      className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
        isActive
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50'
      } ${task.isCompleted ? 'opacity-60' : ''}`}
    >
      <button
        onClick={() => toggleTask(task.id)}
        className="flex-shrink-0"
      >
        {task.isCompleted ? (
          <CheckCircle className="h-5 w-5 text-green-500" />
        ) : (
          <Circle className="h-5 w-5 text-muted-foreground" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p
          className={`text-sm font-medium truncate ${
            task.isCompleted ? 'line-through text-muted-foreground' : ''
          }`}
        >
          {task.title}
        </p>
        <p className="text-xs text-muted-foreground">
          预估 {task.estimatedTomatoes} 个番茄 · 完成 {task.actualTomatoes} 个
        </p>
      </div>

      {!task.isCompleted && (
        <Button
          variant={isActive ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTask(isActive ? null : task.id)}
        >
          <Zap className="h-4 w-4 mr-1" />
          {isActive ? '当前' : '选择'}
        </Button>
      )}

      <Button
        variant="ghost"
        size="icon"
        onClick={() => removeTask(task.id)}
        className="flex-shrink-0 text-muted-foreground hover:text-destructive"
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </div>
  );
}
