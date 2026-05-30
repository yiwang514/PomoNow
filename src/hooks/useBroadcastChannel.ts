'use client';

import { useEffect, useCallback, useRef } from 'react';

// 广播消息类型
export interface BroadcastMessage {
  type: 'TIMER_SYNC' | 'TASK_SYNC' | 'SETTINGS_SYNC';
  payload: any;
  timestamp: number;
  tabId: string;
}

// 生成唯一的标签页 ID
function generateTabId(): string {
  return `tab_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function useBroadcastChannel(channelName: string = 'pomonow_channel') {
  const channelRef = useRef<BroadcastChannel | null>(null);
  const tabIdRef = useRef<string>(generateTabId());
  const handlersRef = useRef<Map<string, (message: BroadcastMessage) => void>>(new Map());

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      channelRef.current = new BroadcastChannel(channelName);

      channelRef.current.onmessage = (event: MessageEvent<BroadcastMessage>) => {
        // 忽略来自同一标签页的消息
        if (event.data.tabId === tabIdRef.current) return;

        // 调用注册的处理器
        const handler = handlersRef.current.get(event.data.type);
        if (handler) {
          handler(event.data);
        }
      };

      return () => {
        channelRef.current?.close();
      };
    } catch (error) {
      console.warn('BroadcastChannel 不可用:', error);
    }
  }, [channelName]);

  // 发送消息
  const sendMessage = useCallback((type: BroadcastMessage['type'], payload: any) => {
    if (!channelRef.current) return;

    const message: BroadcastMessage = {
      type,
      payload,
      timestamp: Date.now(),
      tabId: tabIdRef.current,
    };

    try {
      channelRef.current.postMessage(message);
    } catch (error) {
      console.error('发送广播消息失败:', error);
    }
  }, []);

  // 注册消息处理器
  const onMessage = useCallback((type: BroadcastMessage['type'], handler: (message: BroadcastMessage) => void) => {
    handlersRef.current.set(type, handler);

    return () => {
      handlersRef.current.delete(type);
    };
  }, []);

  return {
    sendMessage,
    onMessage,
    tabId: tabIdRef.current,
  };
}
