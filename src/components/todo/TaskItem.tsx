'use client';

import { useState } from 'react';
import { Task } from '@/types';
import { useTaskStore } from '@/store/useTaskStore';
import { useTimerStore } from '@/store/useTimerStore';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Trash2, CheckCircle2, Circle, Zap, Cherry, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const { removeTask, toggleTask, setActiveTask, activeTaskId, incrementTaskTomatoes } =
    useTaskStore();
  const { status, timeLeft, resetTimer } = useTimerStore();
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);

  const isActive = activeTaskId === task.id;
  // 判断是否正在专注：是当前活动任务且计时器正在运行
  const isFocusing = isActive && status === 'running';

  // 处理提前完成
  const handleEarlyComplete = () => {
    // 当专注时间小于10秒时，不予以记录
    if (timeLeft > 10) {
      incrementTaskTomatoes(task.id);
    }
    // 重置计时器并清除活动任务
    resetTimer();
    setActiveTask(null);
    setShowCompleteDialog(false);
  };

  return (
    <>
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
          {/* 专注期间显示提前完成按钮 */}
          {isFocusing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCompleteDialog(true)}
              className="rounded-xl border-orange-300 text-orange-600 hover:bg-orange-50 hover:text-orange-700"
            >
              <Flag className="h-4 w-4 mr-1" />
              提前完成
            </Button>
          ) : (
            /* 非专注期间显示选择按钮 */
            !task.isCompleted && (
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTask(isActive ? null : task.id)}
                className={cn(
                  "rounded-xl transition-all duration-200",
                  isActive && "shadow-md shadow-primary/25"
                )}
              >
                <Zap className="h-4 w-4 mr-1" />
                {isActive ? '当前' : '选择'}
              </Button>
            )
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

      {/* 提前完成确认对话框 */}
      <Dialog open={showCompleteDialog} onOpenChange={setShowCompleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认提前完成</DialogTitle>
            <DialogDescription>
              你确定要提前完成这次专注吗？
              <br />
              <br />
              当前任务：<span className="font-medium text-foreground">{task.title}</span>
              <br />
              {timeLeft > 10 ? (
                <>本次专注将被记录为一个完整的番茄钟 🍅</>
              ) : (
                <span className="text-muted-foreground">专注时间不足10秒，本次不会记录</span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowCompleteDialog(false)}
            >
              继续专注
            </Button>
            <Button
              onClick={handleEarlyComplete}
              className="bg-orange-500 hover:bg-orange-600"
            >
              <Flag className="h-4 w-4 mr-1" />
              确认完成
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
