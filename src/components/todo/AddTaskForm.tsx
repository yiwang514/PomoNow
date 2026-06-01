'use client';

import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Cherry, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

// 预设专注时长选项（分钟）
const FOCUS_DURATION_OPTIONS = [15, 20, 25, 30, 45, 60];

export function AddTaskForm() {
  const [title, setTitle] = useState('');
  const [estimatedTomatoes, setEstimatedTomatoes] = useState(1);
  const [focusDuration, setFocusDuration] = useState(25); // 默认 25 分钟
  const [isExpanded, setIsExpanded] = useState(false);
  const { addTask } = useTaskStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addTask(title.trim(), estimatedTomatoes, focusDuration);
      setTitle('');
      setEstimatedTomatoes(1);
      setFocusDuration(25);
      setIsExpanded(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="flex gap-3">
        <Input
          type="text"
          placeholder="添加新任务..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          className="flex-1 h-12 rounded-xl border-border bg-card focus:ring-2 focus:ring-primary/20"
        />
        <Button
          type="submit"
          size="icon"
          disabled={!title.trim()}
          className="h-12 w-12 rounded-xl btn-hover-lift"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {isExpanded && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* 专注时长选择 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground w-20">
              <Clock className="h-4 w-4" />
              <span>专注时长:</span>
            </div>
            <div className="flex items-center gap-1 flex-wrap">
              {FOCUS_DURATION_OPTIONS.map((duration) => (
                <button
                  key={duration}
                  type="button"
                  onClick={() => setFocusDuration(duration)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200",
                    focusDuration === duration
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {duration}分钟
                </button>
              ))}
            </div>
          </div>

          {/* 预估番茄数选择 */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground w-20">
              <Cherry className="h-4 w-4" />
              <span>预估番茄:</span>
            </div>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setEstimatedTomatoes(num)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200",
                    estimatedTomatoes === num
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  )}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </form>
  );
}
