'use client';

import { useCallback, useRef, useEffect } from 'react';

// 提示音类型
export type SoundType = 'bell' | 'digital' | 'wood' | 'chime' | 'notification';

// 提示音配置
const SOUND_CONFIGS: Record<SoundType, { frequency: number; duration: number; type: OscillatorType }> = {
  bell: { frequency: 800, duration: 0.3, type: 'sine' },
  digital: { frequency: 1000, duration: 0.2, type: 'square' },
  wood: { frequency: 400, duration: 0.15, type: 'triangle' },
  chime: { frequency: 1200, duration: 0.4, type: 'sine' },
  notification: { frequency: 600, duration: 0.25, type: 'sine' },
};

// 提示音显示名称
export const SOUND_NAMES: Record<SoundType, string> = {
  bell: '清脆铃声',
  digital: '数码滴滴',
  wood: '木鱼声',
  chime: '风铃声',
  notification: '通知音',
};

export function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const isUnlockedRef = useRef(false);

  // 初始化 AudioContext
  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // 解锁音频播放（需要用户交互）
  const unlockAudio = useCallback(() => {
    if (isUnlockedRef.current) return;

    const ctx = getAudioContext();
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    // 播放静音音频来解锁
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    gainNode.gain.value = 0;
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    oscillator.start();
    oscillator.stop(ctx.currentTime + 0.001);

    isUnlockedRef.current = true;
  }, [getAudioContext]);

  // 播放提示音
  const playSound = useCallback((type: SoundType = 'bell') => {
    try {
      const ctx = getAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const config = SOUND_CONFIGS[type];
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.type = config.type;
      oscillator.frequency.setValueAtTime(config.frequency, ctx.currentTime);

      // 音量包络
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration);

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + config.duration);

      // 对于铃声，添加和声效果
      if (type === 'bell' || type === 'chime') {
        const harmonic = ctx.createOscillator();
        const harmonicGain = ctx.createGain();
        harmonic.type = 'sine';
        harmonic.frequency.setValueAtTime(config.frequency * 1.5, ctx.currentTime);
        harmonicGain.gain.setValueAtTime(0, ctx.currentTime);
        harmonicGain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.01);
        harmonicGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + config.duration * 0.8);
        harmonic.connect(harmonicGain);
        harmonicGain.connect(ctx.destination);
        harmonic.start(ctx.currentTime);
        harmonic.stop(ctx.currentTime + config.duration);
      }
    } catch (error) {
      console.error('播放提示音失败:', error);
    }
  }, [getAudioContext]);

  // 预览提示音
  const previewSound = useCallback((type: SoundType) => {
    playSound(type);
  }, [playSound]);

  // 组件卸载时清理
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playSound,
    previewSound,
    unlockAudio,
  };
}
