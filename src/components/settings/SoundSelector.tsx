'use client';

import { useTimerStore } from '@/store/useTimerStore';
import { useSound, SoundType, SOUND_NAMES } from '@/hooks/useSound';
import { Volume2, Play } from 'lucide-react';

export function SoundSelector() {
  const { soundEffect, soundEnabled, setSoundEffect, setSoundEnabled } = useTimerStore();
  const { previewSound } = useSound();

  const soundOptions: SoundType[] = ['bell', 'digital', 'wood', 'chime', 'notification'];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-lg font-medium">
          <Volume2 className="h-5 w-5 text-primary" />
          <span>提示音</span>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={soundEnabled}
            onChange={(e) => setSoundEnabled(e.target.checked)}
            className="w-5 h-5 rounded-md border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-muted-foreground">启用</span>
        </label>
      </div>

      {soundEnabled && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {soundOptions.map((sound) => {
            const isSelected = soundEffect === sound;

            return (
              <button
                key={sound}
                onClick={() => setSoundEffect(sound)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all duration-200 ${
                  isSelected
                    ? 'border-primary bg-primary/5 shadow-md'
                    : 'border-border hover:border-primary/30 hover:bg-muted/50'
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  <Volume2 className="h-5 w-5" />
                </div>

                <div className="flex-1 text-left">
                  <p className={`font-medium ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                    {SOUND_NAMES[sound]}
                  </p>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    previewSound(sound);
                  }}
                  className="p-2 rounded-lg hover:bg-muted transition-colors"
                  title="预览"
                >
                  <Play className="h-4 w-4 text-muted-foreground" />
                </button>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
