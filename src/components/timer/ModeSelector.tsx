'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTimerStore } from '@/store/useTimerStore';

export function ModeSelector() {
  const [mounted, setMounted] = useState(false);
  const { mode, switchMode, status } = useTimerStore();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center gap-2">
        <Button variant="default" size="sm">
          专注
        </Button>
        <Button variant="outline" size="sm">
          短休
        </Button>
        <Button variant="outline" size="sm">
          长休
        </Button>
      </div>
    );
  }

  const modes = [
    { key: 'focus', label: '专注' },
    { key: 'shortBreak', label: '短休' },
    { key: 'longBreak', label: '长休' },
  ] as const;

  return (
    <div className="flex items-center justify-center gap-2">
      {modes.map((m) => (
        <Button
          key={m.key}
          variant={mode === m.key ? 'default' : 'outline'}
          size="sm"
          onClick={() => switchMode(m.key)}
          disabled={status === 'running'}
        >
          {m.label}
        </Button>
      ))}
    </div>
  );
}
