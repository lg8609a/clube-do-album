import React from 'react';

interface SoundwaveVisualizerProps {
  isPlaying?: boolean;
  barCount?: number;
  className?: string;
}

export const SoundwaveVisualizer: React.FC<SoundwaveVisualizerProps> = ({
  isPlaying = true,
  barCount = 16,
  className = '',
}) => {
  return (
    <div className={`flex items-end gap-[3px] h-6 px-1 select-none ${className}`}>
      {Array.from({ length: barCount }).map((_, i) => {
        // Vary heights and delays organically
        const delays = [0.1, 0.4, 0.2, 0.6, 0.3, 0.5, 0.15, 0.45, 0.25, 0.7, 0.35, 0.1, 0.55, 0.2, 0.65, 0.3];
        const delay = delays[i % delays.length];
        const duration = 0.8 + (i % 5) * 0.2;

        return (
          <span
            key={i}
            className={`w-[2.5px] rounded-full transition-all duration-300 ${
              isPlaying
                ? 'bg-gradient-to-t from-red-600 to-rose-400'
                : 'bg-zinc-700 h-1.5'
            }`}
            style={
              isPlaying
                ? {
                    animation: `sound-bar ${duration}s ease-in-out infinite alternate`,
                    animationDelay: `${delay}s`,
                    minHeight: '4px',
                  }
                : undefined
            }
          />
        );
      })}
    </div>
  );
};
