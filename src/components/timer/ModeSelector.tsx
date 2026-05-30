'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTimerStore } from '@/store/useTimerStore';
import { cn } from '@/lib/utils';

export function ModeSelector() {
  const [mounted, setMounted] = useState(false);
  const { mode, switchMode, status } = useTimerStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-2 p-1 bg-muted/50 rounded-2xl">
        <Button variant="default" size="sm" className="rounded-xl px-6">
          专注
        </Button>
        <Button variant="ghost" size="sm" className="rounded-xl px-6">
          短休
        </Button>
        <Button variant="ghost" size="sm" className="rounded-xl px-6">
          长休
        </Button>
      </div>
    );
  }

  const modes = [
    { key: 'focus' as const, label: '专注', color: 'var(--focus-color)' },
    { key: 'shortBreak' as const, label: '短休', color: 'var(--break-color)' },
    { key: 'longBreak' as const, label: '长休', color: 'var(--long-break-color)' },
  ];

  return (
    <div className="flex items-center justify-center gap-2 p-1 bg-muted/50 rounded-2xl">
      {modes.map((m) => (
        <Button
          key={m.key}
          variant={mode === m.key ? 'default' : 'ghost'}
          size="sm"
          onClick={() => switchMode(m.key)}
          disabled={status === 'running'}
          className={cn(
            "rounded-xl px-6 transition-all duration-300",
            mode === m.key && "shadow-lg"
          )}
          style={mode === m.key ? { background: m.color, color: 'white' } : undefined}
        >
          {m.label}
        </Button>
      ))}
    </div>
  );
}
