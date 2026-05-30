'use client';

import { useEffect, useState } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { Settings, Clock, RotateCcw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SettingsPage() {
  const [mounted, setMounted] = useState(false);
  const {
    focusDuration,
    shortBreakDuration,
    longBreakDuration,
    longBreakInterval,
    autoStartBreaks,
    autoStartFocus,
    setFocusDuration,
    setShortBreakDuration,
    setLongBreakDuration,
    setLongBreakInterval,
    setAutoStartBreaks,
    setAutoStartFocus,
    resetPomodoros,
  } = useTimerStore();

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <div className="text-muted-foreground animate-pulse">加载中...</div>
      </div>
    );
  }

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="flex flex-1 flex-col items-center justify-start px-4 py-12 sm:py-16">
      {/* 装饰性背景 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/3 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-lg space-y-8">
        {/* 标题 */}
        <div className="flex items-center gap-3 justify-center">
          <Settings className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-serif font-bold">设置</h1>
        </div>

        {/* 时间设置 */}
        <div className="space-y-6 p-6 bg-card rounded-2xl border border-border">
          <div className="flex items-center gap-2 text-lg font-medium">
            <Clock className="h-5 w-5 text-primary" />
            <span>时间设置</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">专注时长 (分钟)</label>
              <Input
                type="number"
                min={1}
                max={60}
                value={focusDuration}
                onChange={(e) => setFocusDuration(Number(e.target.value))}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">短休息 (分钟)</label>
              <Input
                type="number"
                min={1}
                max={30}
                value={shortBreakDuration}
                onChange={(e) => setShortBreakDuration(Number(e.target.value))}
                className="h-12 rounded-xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">长休息 (分钟)</label>
              <Input
                type="number"
                min={1}
                max={60}
                value={longBreakDuration}
                onChange={(e) => setLongBreakDuration(Number(e.target.value))}
                className="h-12 rounded-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">长休息间隔 (番茄数)</label>
            <Input
              type="number"
              min={1}
              max={10}
              value={longBreakInterval}
              onChange={(e) => setLongBreakInterval(Number(e.target.value))}
              className="h-12 rounded-xl"
            />
          </div>
        </div>

        {/* 自动开始设置 */}
        <div className="space-y-4 p-6 bg-card rounded-2xl border border-border">
          <h3 className="text-lg font-medium">自动开始</h3>

          <div className="space-y-3">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoStartBreaks}
                onChange={(e) => setAutoStartBreaks(e.target.checked)}
                className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary"
              />
              <span className="text-sm">专注结束后自动开始休息</span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoStartFocus}
                onChange={(e) => setAutoStartFocus(e.target.checked)}
                className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary"
              />
              <span className="text-sm">休息结束后自动开始专注</span>
            </label>
          </div>
        </div>

        {/* 操作按钮 */}
        <div className="flex gap-4">
          <Button
            onClick={handleSave}
            className="flex-1 h-12 rounded-xl btn-hover-lift"
          >
            {saved ? (
              <>
                <Save className="mr-2 h-4 w-4" />
                已保存
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                保存设置
              </>
            )}
          </Button>

          <Button
            variant="outline"
            onClick={resetPomodoros}
            className="h-12 rounded-xl"
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            重置统计
          </Button>
        </div>
      </div>
    </div>
  );
}
