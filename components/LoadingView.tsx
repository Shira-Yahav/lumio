'use client';
import { useEffect, useState } from 'react';
import { LOADING_MESSAGES } from '@/lib/data';
import type { QuizSettings } from '@/lib/types';

export default function LoadingView({ settings }: { settings: QuizSettings }) {
  const [msgIdx, setMsgIdx] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setMsgIdx(i => (i + 1) % LOADING_MESSAGES.length);
    }, 1800);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6">
      <div className="w-full max-w-sm text-center space-y-8">
        <div className="flex justify-center gap-2">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="loading-dot w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: 'var(--accent)',
                animationDelay: `${i * 0.2}s`,
                animation: 'pulse 1.4s ease-in-out infinite',
              }}
            />
          ))}
        </div>

        <div className="space-y-2">
          <p className="text-base font-medium" style={{ color: 'var(--text)' }}>
            {LOADING_MESSAGES[msgIdx]}
          </p>
          <p className="text-sm" style={{ color: 'var(--text-3)' }}>
            {settings.count} questions · {settings.topic}
          </p>
        </div>
      </div>
    </div>
  );
}
