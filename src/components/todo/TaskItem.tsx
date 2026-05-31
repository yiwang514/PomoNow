'use client';

import { useRouter } from 'next/navigation';
import { Task } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';
import { useTimerStore } from '@/store/useTimerStore';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle2, Circle, Zap, Cherry, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const router = useRouter();
  const { removeTask, toggleTask, setActiveTask, activeTaskId } =
    useTaskStore();
  const { status, switchMode } = useTimerStore();

  const isActive = activeTaskId === task.id;
  const isFocusing = isActive && status === 'running';

  // 处理开始专注：设置任务并跳转到专注页面
  const handleStartFocus = () => {
    // 设置为当前活动任务
    setActiveTask(task.id);
    // 切换到专注模式
    switchMode('focus');
    // 跳转到专注页面
    router.push('/');
  };

  return (
    <div
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 card-hover",
        isActive
          ? "border-primary bg-primary/5 shadow-lg shadow-primary/10"
          : "border-border hover:border-primary/30 bg-card",
        task.isCompleted && "opacity-60"
      )}
    >
      {/* 完成按钮 */}
      <button
        onClick={() => toggleTask(task.id)}
        className="flex-shrink-0 transition-transform hover:scale-110"
      >
        {task.isCompleted ? (
          <CheckCircle2 className="h-6 w-6 text-green-500" />
        ) : (
          <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
        )}
      </button>

      {/* 任务信息 */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "font-medium truncate transition-colors",
            task.isCompleted ? "line-through text-muted-foreground" : "text-foreground"
          )}
        >
          {task.title}
        </p>
        <div className="flex items-center gap-3 mt-1">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Cherry className="h-3 w-3" />
            <span>预估 {task.estimatedTomatoes}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Zap className="h-3 w-3" />
            <span>完成 {task.actualTomatoes}</span>
          </div>
        </div>
      </div>

      {/* 操作按钮 */}
      <div className="flex items-center gap-2">
        {/* 专注按钮：点击后跳转到专注页面 */}
        {!task.isCompleted && (
          <Button
            variant={isActive ? 'default' : 'ghost'}
            size="sm"
            onClick={handleStartFocus}
            className={cn(
              "rounded-xl transition-all duration-200",
              isActive && "shadow-md shadow-primary/25"
            )}
          >
            <Play className="h-4 w-4 mr-1" />
            {isActive ? '专注中' : '专注'}
          </Button>
        )}

        <Button
          variant="ghost"
          size="icon"
          onClick={() => removeTask(task.id)}
          className="flex-shrink-0 h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
