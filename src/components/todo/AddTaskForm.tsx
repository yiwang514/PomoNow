'use client';

import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Cherry } from 'lucide-react';

export function AddTaskForm() {
  const [title, setTitle] = useState('');
  const [estimatedTomatoes, setEstimatedTomatoes] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);
  const { addTask } = useTaskStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addTask(title.trim(), estimatedTomatoes);
      setTitle('');
      setEstimatedTomatoes(1);
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
        <div className="flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Cherry className="h-4 w-4" />
            <span>预估番茄:</span>
          </div>
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((num) => (
              <button
                key={num}
                type="button"
                onClick={() => setEstimatedTomatoes(num)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-all duration-200 ${
                  estimatedTomatoes === num
                    ? 'bg-primary text-primary-foreground shadow-md'
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  );
}
