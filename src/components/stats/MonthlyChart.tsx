'use client';

import { useMemo } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useTimerStore } from '@/store/useTimerStore';

interface WeekData {
  label: string;
  pomodoros: number;
}

export function MonthlyChart() {
  const { focusDuration } = useTimerStore();
  const { getMonthRecords } = useTaskStore();

  // 获取真实的月度数据
  const monthData = useMemo<WeekData[]>(() => {
    const weeks: WeekData[] = [];
    const monthRecords = getMonthRecords();
    const today = new Date();

    // 将一个月分为4周
    for (let i = 3; i >= 0; i--) {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - (i + 1) * 7);
      const weekEnd = new Date(today);
      weekEnd.setDate(today.getDate() - i * 7);

      // 统计这一周的专注番茄数
      const weekPomodoros = monthRecords.filter((record) => {
        const recordDate = new Date(record.completedAt);
        return (
          recordDate >= weekStart &&
          recordDate < weekEnd &&
          record.type === 'focus'
        );
      }).length;

      weeks.push({
        label: `第${4 - i}周`,
        pomodoros: weekPomodoros,
      });
    }

    return weeks;
  }, [getMonthRecords]);

  const maxPomodoros = Math.max(...monthData.map((w) => w.pomodoros), 1);
  const totalPomodoros = monthData.reduce((sum, w) => sum + w.pomodoros, 0);
  const totalMinutes = totalPomodoros * focusDuration;
  const totalHours = Math.floor(totalMinutes / 60);
  const avgPerDay = Math.round(totalPomodoros / 30);

  return (
    <div className="space-y-6">
      {/* 统计摘要 */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-4 bg-card rounded-2xl border border-border text-center">
          <p className="text-2xl font-serif font-bold text-primary">{totalPomodoros}</p>
          <p className="text-xs text-muted-foreground">本月番茄</p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border text-center">
          <p className="text-2xl font-serif font-bold text-green-500">{totalHours}h</p>
          <p className="text-xs text-muted-foreground">专注时长</p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border text-center">
          <p className="text-2xl font-serif font-bold text-blue-500">{avgPerDay}</p>
          <p className="text-xs text-muted-foreground">日均番茄</p>
        </div>
      </div>

      {/* 柱状图 */}
      <div className="p-6 bg-card rounded-2xl border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">本月趋势</h3>
        <div className="flex items-end justify-between gap-4 h-40">
          {monthData.map((week, index) => {
            const height = maxPomodoros > 0 ? (week.pomodoros / maxPomodoros) * 100 : 0;
            const isCurrentWeek = index === monthData.length - 1;

            return (
              <div key={week.label} className="flex flex-col items-center gap-2 flex-1">
                {/* 数值 */}
                <span className="text-sm font-medium text-muted-foreground">
                  {week.pomodoros}
                </span>

                {/* 柱子 */}
                <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
                  <div
                    className={`w-full rounded-t-lg transition-all duration-500 ${
                      isCurrentWeek
                        ? 'bg-primary shadow-lg shadow-primary/25'
                        : 'bg-primary/30 hover:bg-primary/50'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>

                {/* 标签 */}
                <span
                  className={`text-xs font-medium ${
                    isCurrentWeek ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {week.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
