'use client';
import { useState, useEffect, useRef } from 'react';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import * as Label from '@radix-ui/react-label';
import { Sparkles, ArrowRight, Clock, BookOpen, Mountain, RotateCcw } from 'lucide-react';
import { CATEGORIES } from '@/lib/data';
import type { QuizSettings, QuizCount } from '@/lib/types';
import clsx from 'clsx';

interface Props {
  onGenerate: (settings: QuizSettings) => void;
}

const MODES: { count: QuizCount; label: string; sub: string; icon: React.ReactNode }[] = [
  { count: 5,  label: 'Quick',    sub: '~5 min',   icon: <Clock size={14} /> },
  { count: 10, label: 'Standard', sub: '~10 min',  icon: <BookOpen size={14} /> },
  { count: 20, label: 'Deep',     sub: '~20 min',  icon: <Mountain size={14} /> },
];

const RECENT_KEY = 'lumio_recent_topics';
const MAX_RECENT = 5;

export default function HomeView({ onGenerate }: Props) {
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState<QuizCount>(10);
  const [recentTopics, setRecentTopics] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecentTopics(JSON.parse(stored));
    } catch {}
    inputRef.current?.focus();
  }, []);

  function handleSubmit() {
    const trimmed = topic.trim();
    if (!trimmed) return;

    // Save to recent
    try {
      const updated = [trimmed, ...recentTopics.filter(t => t !== trimmed)].slice(0, MAX_RECENT);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
    } catch {}

    onGenerate({ topic: trimmed, count });
  }

  function pickCategory(prompt: string) {
    setTopic(prompt);
    inputRef.current?.focus();
  }

  function pickRandom() {
    const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
    setTopic(cat.prompt);
    inputRef.current?.focus();
  }

  return (
    <div className="min-h-dvh flex flex-col items-center px-4 py-10">
      <div className="w-full max-w-lg space-y-8 view-enter">

        {/* Brand */}
        <div className="flex flex-col items-center text-center space-y-2 pt-4">
          <div
            className="flex items-center gap-2 mb-1"
            style={{ color: 'var(--accent)' }}
          >
            <Sparkles size={22} />
            <span className="text-2xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              Lumio
            </span>
          </div>
          <p className="text-sm max-w-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
            Turn your commute into a classroom.
            <br />Learn something new in 5 minutes.
          </p>
        </div>

        {/* Topic Input */}
        <div className="space-y-3">
          <Label.Root
            htmlFor="topic-input"
            className="block text-sm font-medium"
            style={{ color: 'var(--text-2)' }}
          >
            What do you want to learn today?
          </Label.Root>

          <div className="relative">
            <input
              ref={inputRef}
              id="topic-input"
              type="text"
              value={topic}
              onChange={e => setTopic(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              placeholder="e.g. how black holes work, stoic philosophy, the French Revolution…"
              className="w-full rounded-xl px-4 py-3.5 text-sm outline-none transition-all"
              style={{
                background: 'var(--surface)',
                border: `1.5px solid var(--border)`,
                color: 'var(--text)',
              }}
              onFocus={e => {
                e.currentTarget.style.borderColor = 'var(--accent)';
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)';
              }}
              onBlur={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Recent topics */}
          {recentTopics.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="text-xs" style={{ color: 'var(--text-3)' }}>Recent:</span>
              {recentTopics.map(t => (
                <button
                  key={t}
                  onClick={() => setTopic(t)}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors"
                  style={{
                    background: 'var(--muted)',
                    color: 'var(--text-2)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <RotateCcw size={10} />
                  {t.length > 30 ? t.slice(0, 30) + '…' : t}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Mode Selector */}
        <div className="space-y-2">
          <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>Quiz length</p>
          <ToggleGroup.Root
            type="single"
            value={count.toString()}
            onValueChange={v => v && setCount(parseInt(v) as QuizCount)}
            className="grid grid-cols-3 gap-2"
          >
            {MODES.map(m => (
              <ToggleGroup.Item
                key={m.count}
                value={m.count.toString()}
                className={clsx(
                  'flex flex-col items-center gap-1 rounded-xl py-3 px-2 text-sm font-medium transition-all outline-none cursor-pointer',
                  'border',
                  count === m.count
                    ? 'border-accent'
                    : 'border-border hover:border-border-strong'
                )}
                style={{
                  background: count === m.count ? 'var(--accent-light)' : 'var(--surface)',
                  color: count === m.count ? 'var(--accent)' : 'var(--text-2)',
                  borderColor: count === m.count ? 'var(--accent)' : 'var(--border)',
                }}
              >
                <span className="flex items-center gap-1">
                  {m.icon}
                  {m.label}
                </span>
                <span className="text-xs font-normal opacity-70">{m.sub} · {m.count}q</span>
              </ToggleGroup.Item>
            ))}
          </ToggleGroup.Root>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleSubmit}
          disabled={!topic.trim()}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all"
          style={{
            background: topic.trim() ? 'var(--accent)' : 'var(--border)',
            color: topic.trim() ? '#fff' : 'var(--text-3)',
            cursor: topic.trim() ? 'pointer' : 'not-allowed',
          }}
          onMouseEnter={e => {
            if (topic.trim()) e.currentTarget.style.background = 'var(--accent-hover)';
          }}
          onMouseLeave={e => {
            if (topic.trim()) e.currentTarget.style.background = 'var(--accent)';
          }}
        >
          Start Learning
          <ArrowRight size={16} />
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>or explore by topic</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 gap-2">
          {CATEGORIES.map(cat => (
            <button
              key={cat.name}
              onClick={() => pickCategory(cat.prompt)}
              className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 text-sm text-left transition-all"
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                color: 'var(--text)',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = 'var(--border-strong)';
                e.currentTarget.style.background = 'var(--muted)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'var(--border)';
                e.currentTarget.style.background = 'var(--surface)';
              }}
            >
              <span className="text-lg leading-none">{cat.emoji}</span>
              <span className="font-medium text-xs" style={{ color: 'var(--text-2)' }}>{cat.name}</span>
            </button>
          ))}
        </div>

        {/* Surprise me */}
        <button
          onClick={pickRandom}
          className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm transition-all"
          style={{
            background: 'transparent',
            border: '1.5px dashed var(--border)',
            color: 'var(--text-3)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--accent)';
            e.currentTarget.style.color = 'var(--accent)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--border)';
            e.currentTarget.style.color = 'var(--text-3)';
          }}
        >
          <Sparkles size={14} />
          Surprise me
        </button>

        <p className="text-center text-xs pb-4" style={{ color: 'var(--text-3)' }}>
          Powered by Claude AI
        </p>
      </div>
    </div>
  );
}
