'use client';

import { useCallback, useState, useEffect } from 'react';

export function useNotification() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported('Notification' in window);
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }
  }, []);

  // 请求通知权限
  const requestPermission = useCallback(async () => {
    if (!('Notification' in window)) {
      console.warn('此浏览器不支持桌面通知');
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === 'granted';
    } catch (error) {
      console.error('请求通知权限失败:', error);
      return false;
    }
  }, []);

  // 发送通知
  const sendNotification = useCallback(async (title: string, options?: NotificationOptions) => {
    if (!('Notification' in window)) {
      console.warn('此浏览器不支持桌面通知');
      return;
    }

    // 如果权限未授予，尝试请求
    if (Notification.permission === 'default') {
      const granted = await requestPermission();
      if (!granted) return;
    }

    if (Notification.permission === 'granted') {
      try {
        const notification = new Notification(title, {
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'pomonow-timer',
          ...options,
        });

        // 点击通知时聚焦窗口
        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // 5秒后自动关闭
        setTimeout(() => {
          notification.close();
        }, 5000);
      } catch (error) {
        console.error('发送通知失败:', error);
      }
    }
  }, [requestPermission]);

  // 发送计时完成通知
  const sendTimerCompleteNotification = useCallback((mode: 'focus' | 'shortBreak' | 'longBreak') => {
    const messages = {
      focus: {
        title: '🍅 专注时间结束！',
        body: '辛苦了！休息一下吧～',
      },
      shortBreak: {
        title: '☕ 短休息结束',
        body: '准备好继续专注了吗？',
      },
      longBreak: {
        title: '🎉 长休息结束',
        body: '充满电了，开始新的番茄吧！',
      },
    };

    const message = messages[mode];
    sendNotification(message.title, { body: message.body });
  }, [sendNotification]);

  return {
    permission,
    isSupported,
    requestPermission,
    sendNotification,
    sendTimerCompleteNotification,
  };
}
