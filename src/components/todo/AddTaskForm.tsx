'use client';

import { useState } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

export function AddTaskForm() {
  const [title, setTitle] = useState('');
  const [estimatedTomatoes, setEstimatedTomatoes] = useState(1);
  const { addTask } = useTaskStore();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (title.trim()) {
      addTask(title.trim(), estimatedTomatoes);
      setTitle('');
      setEstimatedTomatoes(1);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        type="text"
        placeholder="添加新任务..."
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1"
      />
      <Input
        type="number"
        min={1}
        max={20}
        value={estimatedTomatoes}
        onChange={(e) => setEstimatedTomatoes(Number(e.target.value))}
        className="w-20"
        title="预估番茄数"
      />
      <Button type="submit" size="icon" disabled={!title.trim()}>
        <Plus className="h-4 w-4" />
      </Button>
    </form>
  );
}
