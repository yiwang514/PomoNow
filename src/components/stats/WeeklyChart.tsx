'use client';

import { useMemo } from 'react';
import { useTaskStore } from '@/store/useTaskStore';
import { useTimerStore } from '@/store/useTimerStore';

interface DayData {
  date: string;
  dayName: string;
  pomodoros: number;
}

export function WeeklyChart() {
  const { focusDuration } = useTimerStore();
  const { getWeekRecords } = useTaskStore();

  // 获取真实的一周数据
  const weekData = useMemo<DayData[]>(() => {
    const days: DayData[] = [];
    const dayNames = ['日', '一', '二', '三', '四', '五', '六'];
    const today = new Date();
    const weekRecords = getWeekRecords();

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];

      // 统计当天的专注番茄数
      const dayPomodoros = weekRecords.filter(
        (record) =>
          record.completedAt.split('T')[0] === dateStr &&
          record.type === 'focus'
      ).length;

      days.push({
        date: dateStr,
        dayName: dayNames[date.getDay()],
        pomodoros: dayPomodoros,
      });
    }

    return days;
  }, [getWeekRecords]);

  const maxPomodoros = Math.max(...weekData.map((d) => d.pomodoros), 1);
  const totalPomodoros = weekData.reduce((sum, d) => sum + d.pomodoros, 0);
  const totalMinutes = totalPomodoros * focusDuration;
  const totalHours = Math.floor(totalMinutes / 60);
  const remainingMinutes = totalMinutes % 60;

  return (
    <div className="space-y-6">
      {/* 统计摘要 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-card rounded-2xl border border-border text-center">
          <p className="text-3xl font-serif font-bold text-primary">{totalPomodoros}</p>
          <p className="text-sm text-muted-foreground">本周番茄</p>
        </div>
        <div className="p-4 bg-card rounded-2xl border border-border text-center">
          <p className="text-3xl font-serif font-bold text-blue-500">
            {totalHours > 0 ? `${totalHours}h${remainingMinutes}m` : `${remainingMinutes}m`}
          </p>
          <p className="text-sm text-muted-foreground">专注时长</p>
        </div>
      </div>

      {/* 柱状图 */}
      <div className="p-6 bg-card rounded-2xl border border-border">
        <h3 className="text-sm font-medium text-muted-foreground mb-4">本周趋势</h3>
        <div className="flex items-end justify-between gap-2 h-40">
          {weekData.map((day, index) => {
            const height = maxPomodoros > 0 ? (day.pomodoros / maxPomodoros) * 100 : 0;
            const isToday = index === 6;

            return (
              <div key={day.date} className="flex flex-col items-center gap-2 flex-1">
                {/* 数值 */}
                <span className="text-xs font-medium text-muted-foreground">
                  {day.pomodoros}
                </span>

                {/* 柱子 */}
                <div className="w-full flex items-end justify-center" style={{ height: '120px' }}>
                  <div
                    className={`w-full max-w-[32px] rounded-t-lg transition-all duration-500 ${
                      isToday
                        ? 'bg-primary shadow-lg shadow-primary/25'
                        : 'bg-primary/30 hover:bg-primary/50'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>

                {/* 日期标签 */}
                <span
                  className={`text-xs font-medium ${
                    isToday ? 'text-primary' : 'text-muted-foreground'
                  }`}
                >
                  {day.dayName}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
