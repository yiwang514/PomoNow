'use client';

import { useEffect, useState } from 'react';
import { useTimerStore } from '@/store/useTimerStore';
import { useTaskStore } from '@/store/useTaskStore';
import { WeeklyChart } from '@/components/stats/WeeklyChart';
import { MonthlyChart } from '@/components/stats/MonthlyChart';
import { BarChart3, Clock, Target, Zap, TrendingUp, Calendar } from 'lucide-react';

type ViewMode = 'week' | 'month';

export default function StatsPage() {
  const [mounted, setMounted] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const { completedPomodoros, focusDuration } = useTimerStore();
  const { tasks } = useTaskStore();

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

  const completedTasks = tasks.filter((t) => t.isCompleted).length;
  const totalTasks = tasks.length;
  const totalFocusMinutes = completedPomodoros * focusDuration;
  const totalFocusHours = Math.floor(totalFocusMinutes / 60);
  const remainingMinutes = totalFocusMinutes % 60;

  const stats = [
    {
      icon: Zap,
      label: '今日番茄',
      value: completedPomodoros,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      icon: Clock,
      label: '今日专注',
      value: totalFocusHours > 0
        ? `${totalFocusHours}小时${remainingMinutes}分钟`
        : `${remainingMinutes}分钟`,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
    },
    {
      icon: Target,
      label: '完成任务',
      value: `${completedTasks}/${totalTasks}`,
      color: 'text-green-500',
      bg: 'bg-green-500/10',
    },
    {
      icon: TrendingUp,
      label: '完成率',
      value: totalTasks > 0
        ? `${Math.round((completedTasks / totalTasks) * 100)}%`
        : '0%',
      color: 'text-purple-500',
      bg: 'bg-purple-500/10',
    },
  ];

  return (
    <div className="flex flex-1 flex-col items-center justify-start px-4 py-12 sm:py-16">
      {/* 装饰性背景 */}
      <div className="fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-2xl space-y-8">
        {/* 标题 */}
        <div className="flex items-center gap-3 justify-center">
          <BarChart3 className="h-6 w-6 text-primary" />
          <h1 className="text-3xl font-serif font-bold">数据统计</h1>
        </div>

        {/* 今日统计卡片 */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border card-hover animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className={`p-2 rounded-xl ${stat.bg}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className="text-xl font-serif font-bold">{stat.value}</span>
                <span className="text-xs text-muted-foreground">{stat.label}</span>
              </div>
            );
          })}
        </div>

        {/* 视图切换 */}
        <div className="flex items-center justify-center gap-2 p-1 bg-muted/50 rounded-2xl">
          <button
            onClick={() => setViewMode('week')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'week'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="h-4 w-4" />
            本周
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              viewMode === 'month'
                ? 'bg-primary text-primary-foreground shadow-md'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Calendar className="h-4 w-4" />
            本月
          </button>
        </div>

        {/* 图表 */}
        {viewMode === 'week' ? <WeeklyChart /> : <MonthlyChart />}

        {/* 提示信息 */}
        {completedPomodoros === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-20" />
            <p>还没有数据</p>
            <p className="text-sm">完成你的第一个番茄钟吧！</p>
          </div>
        )}
      </div>
    </div>
  );
}
