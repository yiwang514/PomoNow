'use client';

import { useTimerStore } from '@/store/useTimerStore';
import { useNotification } from '@/hooks/useNotification';
import { Bell, BellOff, AlertCircle } from 'lucide-react';

export function NotificationSettings() {
  const { notificationEnabled, setNotificationEnabled } = useTimerStore();
  const { permission, isSupported, requestPermission } = useNotification();

  const handleToggle = async () => {
    if (!notificationEnabled) {
      // 尝试启用通知
      if (permission !== 'granted') {
        const granted = await requestPermission();
        if (!granted) {
          return; // 用户拒绝了权限
        }
      }
      setNotificationEnabled(true);
    } else {
      setNotificationEnabled(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
        <AlertCircle className="h-5 w-5 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">您的浏览器不支持桌面通知</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Bell className="h-5 w-5 text-primary" />
          <span>桌面通知</span>
        </div>
      </div>

      <div className="space-y-3">
        <button
          onClick={handleToggle}
          className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-200 ${
            notificationEnabled
              ? 'border-primary bg-primary/5'
              : 'border-border hover:border-primary/30'
          }`}
        >
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center ${
              notificationEnabled ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
            }`}
          >
            {notificationEnabled ? <Bell className="h-6 w-6" /> : <BellOff className="h-6 w-6" />}
          </div>

          <div className="flex-1 text-left">
            <p className={`font-medium ${notificationEnabled ? 'text-primary' : 'text-foreground'}`}>
              {notificationEnabled ? '通知已开启' : '开启桌面通知'}
            </p>
            <p className="text-sm text-muted-foreground">
              {notificationEnabled
                ? '计时结束时将收到桌面通知提醒'
                : '即使在后台标签页也能收到提醒'}
            </p>
          </div>

          <div
            className={`w-12 h-6 rounded-full transition-colors duration-200 ${
              notificationEnabled ? 'bg-primary' : 'bg-muted'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${
                notificationEnabled ? 'translate-x-6' : 'translate-x-0.5'
              }`}
            />
          </div>
        </button>

        {permission === 'denied' && (
          <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-xl text-sm">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>通知权限被拒绝，请在浏览器设置中允许通知</span>
          </div>
        )}
      </div>
    </div>
  );
}
