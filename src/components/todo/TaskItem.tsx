'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
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
import { Trash2, CheckCircle2, Circle, Zap, Cherry, Play, Pause, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskItemProps {
  task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
  const router = useRouter();
  const { removeTask, toggleTask, setActiveTask, activeTaskId } =
    useTaskStore();
  const { status, resetTimer } = useTimerStore();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const isActive = activeTaskId === task.id;
  const isRunning = isActive && status === 'running';
  const isPaused = isActive && status === 'paused';

  // 处理专注按钮点击
  const handleFocusClick = () => {
    if (isActive) {
      // 如果已经是活动任务（运行中或暂停），只跳转不重置
      router.push('/');
    } else {
      // 设置为当前活动任务
      setActiveTask(task.id);
      // 设置计时器为任务的专注时长
      useTimerStore.setState({
        timeLeft: task.focusDuration * 60,
        focusDuration: task.focusDuration,
      });
      // 跳转到专注页面
      router.push('/');
    }
  };

  // 处理删除任务
  const handleDelete = () => {
    // 如果删除的是当前活动任务且处于暂停状态，需要重置计时器
    if (isActive) {
      resetTimer();
      setActiveTask(null);
    }
    removeTask(task.id);
    setShowDeleteDialog(false);
  };

  // 处理删除按钮点击
  const handleDeleteClick = () => {
    // 如果是暂停状态的活动任务，弹出确认框
    if (isPaused) {
      setShowDeleteDialog(true);
    } else {
      removeTask(task.id);
    }
  };

  // 获取专注按钮的文案和图标
  const getButtonContent = () => {
    if (isRunning) {
      return (
        <>
          <Play className="h-4 w-4 mr-1" />
          专注中
        </>
      );
    }
    if (isPaused) {
      return (
        <>
          <Pause className="h-4 w-4 mr-1" />
          暂停中
        </>
      );
    }
    return (
      <>
        <Play className="h-4 w-4 mr-1" />
        专注
      </>
    );
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
              <Clock className="h-3 w-3" />
              <span>{task.focusDuration}分钟</span>
            </div>
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
          {/* 专注按钮 */}
          {!task.isCompleted && (
            <Button
              variant={isActive ? 'default' : 'ghost'}
              size="sm"
              onClick={handleFocusClick}
              className={cn(
                "rounded-xl transition-all duration-200",
                isRunning && "bg-green-600 hover:bg-green-700 shadow-md shadow-green-500/25",
                isPaused && "bg-orange-500 hover:bg-orange-600 shadow-md shadow-orange-500/25"
              )}
            >
              {getButtonContent()}
            </Button>
          )}

          {/* 删除按钮 */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDeleteClick}
            className="flex-shrink-0 h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* 删除确认对话框（暂停状态） */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>确认删除任务</DialogTitle>
            <DialogDescription>
              当前任务正在专注中（已暂停），删除后专注计时将被重置。
              <br />
              <br />
              任务名称：<span className="font-medium text-foreground">{task.title}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              取消
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              确认删除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
