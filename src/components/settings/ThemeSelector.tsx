'use client';

import { useState, useEffect } from 'react';
import { Palette, Check } from 'lucide-react';

// 预设主题色
const THEME_COLORS = [
  { name: '番茄红', value: '#c75c3a', darkValue: '#e07a5a' },
  { name: '森林绿', value: '#4a7c59', darkValue: '#6b9b7a' },
  { name: '海洋蓝', value: '#5b7fa5', darkValue: '#7b9fc5' },
  { name: '琥珀黄', value: '#d4a76a', darkValue: '#e4c08a' },
  { name: '紫罗兰', value: '#8b6b8a', darkValue: '#ab8baa' },
  { name: '石墨灰', value: '#5a5249', darkValue: '#8a8078' },
];

export function ThemeSelector() {
  const [selectedColor, setSelectedColor] = useState(THEME_COLORS[0].value);
  const [isDark, setIsDark] = useState(false);

  // 检测暗色模式
  useEffect(() => {
    const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setIsDark(darkModeMediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => darkModeMediaQuery.removeEventListener('change', handleChange);
  }, []);

  // 应用主题色
  const applyThemeColor = (color: typeof THEME_COLORS[0]) => {
    setSelectedColor(color.value);
    const root = document.documentElement;
    const colorValue = isDark ? color.darkValue : color.value;
    root.style.setProperty('--primary', colorValue);
    root.style.setProperty('--focus-color', colorValue);

    // 保存到本地存储
    localStorage.setItem('theme-color', color.value);
  };

  // 加载保存的主题色
  useEffect(() => {
    const savedColor = localStorage.getItem('theme-color');
    if (savedColor) {
      const color = THEME_COLORS.find((c) => c.value === savedColor);
      if (color) {
        applyThemeColor(color);
      }
    }
  }, [isDark]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-medium">
        <Palette className="h-5 w-5 text-primary" />
        <span>主题颜色</span>
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {THEME_COLORS.map((color) => {
          const isSelected = selectedColor === color.value;
          const displayColor = isDark ? color.darkValue : color.value;

          return (
            <button
              key={color.value}
              onClick={() => applyThemeColor(color)}
              className="flex flex-col items-center gap-2 group"
            >
              <div
                className={`relative w-12 h-12 rounded-xl transition-all duration-200 ${
                  isSelected
                    ? 'ring-2 ring-offset-2 ring-offset-background scale-110'
                    : 'hover:scale-105'
                }`}
                style={{
                  background: displayColor,
                  '--ring-color': isSelected ? displayColor : undefined,
                } as React.CSSProperties}
              >
                {isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground group-hover:text-foreground transition-colors">
                {color.name}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
