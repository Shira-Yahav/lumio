'use client';
import { useState, useEffect, useRef } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import * as Label from '@radix-ui/react-label';
import * as Separator from '@radix-ui/react-separator';
import {
  GraduationCap, Brain, ArrowLeft, ArrowRight, Shuffle,
  RotateCcw, History, Clock,
} from 'lucide-react';
import { CATEGORY_GROUPS, ALL_CATEGORIES, inferSubject } from '@/lib/categories';
import { TIME_OPTIONS } from '@/lib/data';
import type { QuizSettings, TimeValue } from '@/lib/types';
import clsx from 'clsx';

type Step = 'mode' | 'topic' | 'time';
type Mode = 'learn' | 'quiz';

const RECENT_KEY = 'lumio_recent_topics';

interface Props {
  onLearn: (s: QuizSettings) => void;
  onQuiz: (s: QuizSettings) => void;
  onHistory: () => void;
}

export default function HomeWizard({ onLearn, onQuiz, onHistory }: Props) {
  const [step, setStep] = useState<Step>('mode');
  const [mode, setMode] = useState<Mode>('quiz');
  const [topic, setTopic] = useState('');
  const [time, setTime] = useState<TimeValue>('10');
  const [recentTopics, setRecentTopics] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(RECENT_KEY);
      if (stored) setRecentTopics(JSON.parse(stored));
    } catch {}
  }, []);

  useEffect(() => {
    if (step === 'topic') setTimeout(() => inputRef.current?.focus(), 50);
  }, [step]);

  function saveRecent(t: string) {
    try {
      const updated = [t, ...recentTopics.filter(r => r !== t)].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      setRecentTopics(updated);
    } catch {}
  }

  function selectMode(m: Mode) {
    setMode(m);
    setStep('topic');
  }

  function handleTopicNext() {
    if (!topic.trim()) return;
    setStep('time');
  }

  function handleSubmit() {
    const trimmed = topic.trim();
    if (!trimmed) return;
    saveRecent(trimmed);
    const settings: QuizSettings = {
      topic: trimmed,
      time,
      mode,
      subject: inferSubject(trimmed),
    };
    if (mode === 'learn') onLearn(settings);
    else onQuiz(settings);
  }

  function pickCategory(prompt: string) {
    setTopic(prompt);
    inputRef.current?.focus();
  }

  function pickRandom() {
    const cat = ALL_CATEGORIES[Math.floor(Math.random() * ALL_CATEGORIES.length)];
    setTopic(cat.prompt);
  }

  const stepIndex = step === 'mode' ? 0 : step === 'topic' ? 1 : 2;

  return (
    <div className="min-h-dvh flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg">

        {/* Header row */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            {step !== 'mode' && (
              <button
                onClick={() => setStep(step === 'time' ? 'topic' : 'mode')}
                className="flex items-center gap-1 text-sm transition-colors p-1 -ml-1 rounded-lg"
                style={{ color: 'var(--text-2)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
              >
                <ArrowLeft size={15} />
              </button>
            )}
            <span className="text-xl font-bold tracking-tight" style={{ color: 'var(--text)' }}>
              Lumio
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Step dots */}
            <div className="flex gap-1.5">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="rounded-full transition-all"
                  style={{
                    width: i === stepIndex ? 16 : 6,
                    height: 6,
                    background: i === stepIndex ? 'var(--accent)' : 'var(--border)',
                  }}
                />
              ))}
            </div>

            <button
              onClick={onHistory}
              className="flex items-center gap-1.5 text-sm px-2.5 py-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--text-2)', background: 'var(--muted)', border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
            >
              <History size={13} />
              <span className="text-xs font-medium">History</span>
            </button>
          </div>
        </div>

        {/* ── Step 1: Mode ─────────────────────────────────────────── */}
        {step === 'mode' && (
          <div className="space-y-6 view-enter">
            <div className="space-y-1">
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
                What would you like to do?
              </h1>
              <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                Turn your free minutes into something worth keeping.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => selectMode('learn')}
                className="flex flex-col items-start gap-4 rounded-2xl p-5 text-left transition-all"
                style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                  <GraduationCap size={18} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1" style={{ color: 'var(--text)' }}>Teach Me</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
                    Read a structured lesson with visuals
                  </p>
                </div>
              </button>

              <button
                onClick={() => selectMode('quiz')}
                className="flex flex-col items-start gap-4 rounded-2xl p-5 text-left transition-all"
                style={{ background: 'var(--accent)', border: '1.5px solid var(--accent)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.2)' }}>
                  <Brain size={18} style={{ color: '#fff' }} />
                </div>
                <div>
                  <p className="font-semibold text-sm mb-1" style={{ color: '#fff' }}>Quiz Me</p>
                  <p className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    Test your knowledge with questions
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Topic ────────────────────────────────────────── */}
        {step === 'topic' && (
          <div className="space-y-5 view-enter">
            <div className="space-y-1">
              <div
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-2"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                {mode === 'learn' ? <GraduationCap size={11} /> : <Brain size={11} />}
                {mode === 'learn' ? 'Learn' : 'Quiz'}
              </div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                What do you want to explore?
              </h2>
            </div>

            {/* Input */}
            <div className="space-y-2">
              <Label.Root htmlFor="topic-input" className="sr-only">Topic</Label.Root>
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  id="topic-input"
                  type="text"
                  value={topic}
                  onChange={e => setTopic(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleTopicNext()}
                  placeholder="e.g. how black holes work, stoic philosophy…"
                  className="flex-1 rounded-xl px-4 py-3 text-sm outline-none transition-all"
                  style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--text)' }}
                  onFocus={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                  onBlur={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.boxShadow = 'none'; }}
                />
                <button
                  onClick={pickRandom}
                  title="Surprise me"
                  className="w-11 h-11 flex items-center justify-center rounded-xl transition-all flex-shrink-0"
                  style={{ background: 'var(--surface)', border: '1.5px solid var(--border)', color: 'var(--text-2)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
                >
                  <Shuffle size={15} />
                </button>
              </div>

              {/* Recent */}
              {recentTopics.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {recentTopics.map(t => (
                    <button
                      key={t}
                      onClick={() => setTopic(t)}
                      className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors"
                      style={{ background: 'var(--muted)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                    >
                      <RotateCcw size={9} />
                      {t.length > 28 ? t.slice(0, 28) + '…' : t}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Separator.Root style={{ height: 1, background: 'var(--border)' }} />

            {/* Category groups via Radix Tabs */}
            <div className="space-y-3">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
                Or pick a subject
              </p>

              <Tabs.Root defaultValue="science">
                <Tabs.List
                  className="flex gap-1 p-1 rounded-xl mb-4"
                  style={{ background: 'var(--muted)' }}
                >
                  {CATEGORY_GROUPS.map(g => (
                    <Tabs.Trigger
                      key={g.value}
                      value={g.value}
                      className="flex-1 text-xs font-medium py-1.5 px-2 rounded-lg outline-none transition-all cursor-pointer"
                      style={{ color: 'var(--text-2)' }}
                      onMouseEnter={e => { if (!e.currentTarget.getAttribute('data-state')?.includes('active')) e.currentTarget.style.color = 'var(--text)'; }}
                      onMouseLeave={e => { if (!e.currentTarget.getAttribute('data-state')?.includes('active')) e.currentTarget.style.color = 'var(--text-2)'; }}
                    >
                      {g.label}
                    </Tabs.Trigger>
                  ))}
                </Tabs.List>

                {CATEGORY_GROUPS.map(g => (
                  <Tabs.Content key={g.value} value={g.value}>
                    <div className="grid grid-cols-1 gap-2">
                      {g.categories.map(cat => {
                        const Icon = cat.icon;
                        return (
                          <button
                            key={cat.name}
                            onClick={() => pickCategory(cat.prompt)}
                            className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm text-left transition-all"
                            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
                          >
                            <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'var(--muted)' }}>
                              <Icon size={14} style={{ color: 'var(--accent)' }} />
                            </div>
                            <span className="font-medium" style={{ color: 'var(--text)' }}>{cat.name}</span>
                          </button>
                        );
                      })}
                    </div>
                  </Tabs.Content>
                ))}
              </Tabs.Root>
            </div>

            {/* Next CTA */}
            <button
              onClick={handleTopicNext}
              disabled={!topic.trim()}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all mt-2"
              style={{
                background: topic.trim() ? 'var(--accent)' : 'var(--border)',
                color: topic.trim() ? '#fff' : 'var(--text-3)',
                cursor: topic.trim() ? 'pointer' : 'not-allowed',
              }}
              onMouseEnter={e => { if (topic.trim()) e.currentTarget.style.background = 'var(--accent-hover)'; }}
              onMouseLeave={e => { if (topic.trim()) e.currentTarget.style.background = 'var(--accent)'; }}
            >
              Continue
              <ArrowRight size={15} />
            </button>
          </div>
        )}

        {/* ── Step 3: Time ─────────────────────────────────────────── */}
        {step === 'time' && (
          <div className="space-y-6 view-enter">
            <div className="space-y-1">
              <div
                className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full mb-2"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                {mode === 'learn' ? <GraduationCap size={11} /> : <Brain size={11} />}
                {topic.length > 40 ? topic.slice(0, 40) + '…' : topic}
              </div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                How much time do you have?
              </h2>
            </div>

            <ToggleGroup.Root
              type="single"
              value={time}
              onValueChange={v => v && setTime(v as TimeValue)}
              className="flex flex-col gap-2"
            >
              {TIME_OPTIONS.map(opt => {
                const isSelected = time === opt.value;
                const desc = mode === 'learn' ? opt.learnDesc : opt.quizDesc;
                return (
                  <ToggleGroup.Item
                    key={opt.value}
                    value={opt.value}
                    className="flex items-center gap-4 rounded-2xl px-5 py-4 text-left transition-all outline-none cursor-pointer border"
                    style={{
                      background: isSelected ? 'var(--accent-light)' : 'var(--surface)',
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                      boxShadow: isSelected ? '0 0 0 1px var(--accent)' : 'none',
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ background: isSelected ? 'var(--accent)' : 'var(--muted)' }}
                    >
                      <Clock size={16} style={{ color: isSelected ? '#fff' : 'var(--text-2)' }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-semibold text-base" style={{ color: isSelected ? 'var(--accent)' : 'var(--text)' }}>
                          {opt.label}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text-3)' }}>{opt.sublabel}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--text-2)' }}>{desc}</p>
                    </div>
                    <div
                      className="w-4 h-4 rounded-full border-2 flex-shrink-0"
                      style={{
                        borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                        background: isSelected ? 'var(--accent)' : 'transparent',
                      }}
                    />
                  </ToggleGroup.Item>
                );
              })}
            </ToggleGroup.Root>

            <button
              onClick={handleSubmit}
              className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              {mode === 'learn' ? (
                <><GraduationCap size={15} /> Start Learning</>
              ) : (
                <><Brain size={15} /> Start Quiz</>
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
