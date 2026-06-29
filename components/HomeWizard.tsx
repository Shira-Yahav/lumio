'use client';
import { useState, useEffect, useRef } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as ToggleGroup from '@radix-ui/react-toggle-group';
import * as Label from '@radix-ui/react-label';
import * as Separator from '@radix-ui/react-separator';
import {
  GraduationCap, Brain, ArrowLeft, ArrowRight,
  Shuffle, RotateCcw, History, Clock, Sparkles,
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
      const updated = [t, ...recentTopics.filter(r => r !== t)].slice(0, 6);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      setRecentTopics(updated);
    } catch {}
  }

  function selectMode(m: Mode) { setMode(m); setStep('topic'); }

  function handleTopicNext() { if (topic.trim()) setStep('time'); }

  function handleSubmit() {
    const trimmed = topic.trim();
    if (!trimmed) return;
    saveRecent(trimmed);
    const settings: QuizSettings = { topic: trimmed, time, mode, subject: inferSubject(trimmed) };
    mode === 'learn' ? onLearn(settings) : onQuiz(settings);
  }

  function pickCategory(prompt: string) { setTopic(prompt); inputRef.current?.focus(); }
  function pickRandom() { const cat = ALL_CATEGORIES[Math.floor(Math.random() * ALL_CATEGORIES.length)]; setTopic(cat.prompt); }

  const stepIndex = step === 'mode' ? 0 : step === 'topic' ? 1 : 2;

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* ── Nav bar ─────────────────────────────────────────────────── */}
      <header
        className="flex items-center justify-between px-6 py-4 sticky top-0 z-20"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          {step !== 'mode' && (
            <button
              onClick={() => setStep(step === 'time' ? 'topic' : 'mode')}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
              style={{ color: 'var(--text-2)', background: 'var(--muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
            >
              <ArrowLeft size={15} />
            </button>
          )}
          <div className="flex items-center gap-1.5">
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            <span className="font-bold tracking-tight" style={{ color: 'var(--text)' }}>Lumio</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Step indicator */}
          <div className="hidden sm:flex gap-1.5 items-center">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="rounded-full transition-all duration-300"
                style={{
                  width: i === stepIndex ? 20 : 6,
                  height: 6,
                  background: i === stepIndex ? 'var(--accent)' : i < stepIndex ? '#a5b4fc' : 'var(--border)',
                }}
              />
            ))}
          </div>
          <button
            onClick={onHistory}
            className="flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--text-2)', border: '1px solid var(--border)', background: 'var(--surface)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <History size={13} />
            <span className="hidden sm:inline">History</span>
          </button>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main className="flex-1 px-6 py-10 md:py-16">

        {/* ── Step 1: Mode ──────────────────────────────────────────── */}
        {step === 'mode' && (
          <div className="max-w-4xl mx-auto view-enter">
            <div className="mb-10 md:mb-12">
              <h1 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: 'var(--text)' }}>
                What would you like to do?
              </h1>
              <p className="text-base md:text-lg" style={{ color: 'var(--text-2)' }}>
                Turn your free minutes into something worth keeping.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 max-w-2xl">
              {/* Learn card */}
              <button
                onClick={() => selectMode('learn')}
                className="group flex flex-col items-start gap-5 rounded-2xl p-7 text-left transition-all"
                style={{ background: 'var(--surface)', border: '1.5px solid var(--border)' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--accent-light)' }}>
                  <GraduationCap size={20} style={{ color: 'var(--accent)' }} />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1.5" style={{ color: 'var(--text)' }}>Teach Me</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'var(--text-2)' }}>
                    Read a structured lesson with key facts and visual diagrams. Great for new topics.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--accent)' }}>
                  Start a lesson <ArrowRight size={14} />
                </div>
              </button>

              {/* Quiz card */}
              <button
                onClick={() => selectMode('quiz')}
                className="group flex flex-col items-start gap-5 rounded-2xl p-7 text-left transition-all"
                style={{ background: 'var(--accent)', border: '1.5px solid var(--accent)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                  <Brain size={20} style={{ color: '#fff' }} />
                </div>
                <div>
                  <p className="font-semibold text-lg mb-1.5" style={{ color: '#fff' }}>Quiz Me</p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    Test your knowledge with multiple-choice questions. Perfect for staying sharp.
                  </p>
                </div>
                <div className="flex items-center gap-1 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
                  Start a quiz <ArrowRight size={14} />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* ── Step 2: Topic ─────────────────────────────────────────── */}
        {step === 'topic' && (
          <div className="max-w-5xl mx-auto view-enter">
            {/* Mode badge */}
            <div className="flex items-center gap-2 mb-6">
              <div
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                {mode === 'learn' ? <GraduationCap size={11} /> : <Brain size={11} />}
                {mode === 'learn' ? 'Teach Me' : 'Quiz Me'}
              </div>
            </div>

            <div className="md:grid md:grid-cols-[1fr_1.4fr] md:gap-12 md:items-start">
              {/* Left: input + recent */}
              <div className="space-y-4">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
                    What do you want to explore?
                  </h2>
                  <p className="text-sm" style={{ color: 'var(--text-2)' }}>
                    Type anything — a concept, a question, a field of interest.
                  </p>
                </div>

                <Label.Root htmlFor="topic-input" className="sr-only">Topic</Label.Root>
                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    id="topic-input"
                    type="text"
                    value={topic}
                    onChange={e => setTopic(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleTopicNext()}
                    placeholder="e.g. how black holes work, stoic philosophy, the French Revolution…"
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
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>Recent</p>
                    <div className="flex flex-wrap gap-1.5">
                      {recentTopics.map(t => (
                        <button
                          key={t}
                          onClick={() => setTopic(t)}
                          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full transition-colors"
                          style={{ background: 'var(--muted)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
                          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.color = 'var(--text)'; }}
                          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-2)'; }}
                        >
                          <RotateCcw size={9} />
                          {t.length > 32 ? t.slice(0, 32) + '…' : t}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Continue — visible on desktop in left column */}
                <div className="hidden md:block pt-2">
                  <button
                    onClick={handleTopicNext}
                    disabled={!topic.trim()}
                    className="flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all"
                    style={{
                      background: topic.trim() ? 'var(--accent)' : 'var(--border)',
                      color: topic.trim() ? '#fff' : 'var(--text-3)',
                      cursor: topic.trim() ? 'pointer' : 'not-allowed',
                    }}
                    onMouseEnter={e => { if (topic.trim()) e.currentTarget.style.background = 'var(--accent-hover)'; }}
                    onMouseLeave={e => { if (topic.trim()) e.currentTarget.style.background = 'var(--accent)'; }}
                  >
                    Continue <ArrowRight size={15} />
                  </button>
                </div>
              </div>

              {/* Right: category tabs + chips */}
              <div className="mt-6 md:mt-0">
                <p className="text-xs font-medium uppercase tracking-wider mb-3" style={{ color: 'var(--text-3)' }}>
                  Or browse by subject
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
                        className="flex-1 text-xs font-medium py-1.5 rounded-lg outline-none transition-all cursor-pointer"
                        style={{ color: 'var(--text-2)' }}
                      >
                        {g.label}
                      </Tabs.Trigger>
                    ))}
                  </Tabs.List>

                  {CATEGORY_GROUPS.map(g => (
                    <Tabs.Content key={g.value} value={g.value} className="focus:outline-none">
                      <div className="flex flex-wrap gap-2">
                        {g.categories.map(cat => {
                          const Icon = cat.icon;
                          const isActive = topic === cat.prompt;
                          return (
                            <button
                              key={cat.name}
                              onClick={() => pickCategory(cat.prompt)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm transition-all"
                              style={{
                                background: isActive ? 'var(--accent)' : 'var(--surface)',
                                color: isActive ? '#fff' : 'var(--text)',
                                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
                              }}
                              onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.background = 'var(--accent-light)'; } }}
                              onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text)'; e.currentTarget.style.background = 'var(--surface)'; } }}
                            >
                              <Icon size={13} />
                              {cat.name}
                            </button>
                          );
                        })}
                      </div>
                    </Tabs.Content>
                  ))}
                </Tabs.Root>
              </div>
            </div>

            {/* Continue — mobile only */}
            <div className="md:hidden mt-6">
              <button
                onClick={handleTopicNext}
                disabled={!topic.trim()}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3.5 text-sm font-semibold transition-all"
                style={{
                  background: topic.trim() ? 'var(--accent)' : 'var(--border)',
                  color: topic.trim() ? '#fff' : 'var(--text-3)',
                  cursor: topic.trim() ? 'pointer' : 'not-allowed',
                }}
                onMouseEnter={e => { if (topic.trim()) e.currentTarget.style.background = 'var(--accent-hover)'; }}
                onMouseLeave={e => { if (topic.trim()) e.currentTarget.style.background = 'var(--accent)'; }}
              >
                Continue <ArrowRight size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3: Time ──────────────────────────────────────────── */}
        {step === 'time' && (
          <div className="max-w-3xl mx-auto view-enter">
            <div className="flex items-center gap-2 mb-6">
              <div
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full"
                style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
              >
                {mode === 'learn' ? <GraduationCap size={11} /> : <Brain size={11} />}
                {topic.length > 50 ? topic.slice(0, 50) + '…' : topic}
              </div>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold mb-2" style={{ color: 'var(--text)' }}>
              How much time do you have?
            </h2>
            <p className="text-sm mb-8" style={{ color: 'var(--text-2)' }}>
              This determines the depth of your {mode === 'learn' ? 'lesson' : 'quiz'}.
            </p>

            <ToggleGroup.Root
              type="single"
              value={time}
              onValueChange={v => v && setTime(v as TimeValue)}
              className="grid md:grid-cols-3 gap-3 mb-8"
            >
              {TIME_OPTIONS.map(opt => {
                const isSelected = time === opt.value;
                const desc = mode === 'learn' ? opt.learnDesc : opt.quizDesc;
                return (
                  <ToggleGroup.Item
                    key={opt.value}
                    value={opt.value}
                    className="flex flex-col items-start gap-3 rounded-2xl px-5 py-5 text-left outline-none cursor-pointer border transition-all"
                    style={{
                      background: isSelected ? 'var(--accent-light)' : 'var(--surface)',
                      borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                      boxShadow: isSelected ? '0 0 0 1px var(--accent)' : 'none',
                    }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--border-strong)'; } }}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--border)'; } }}
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: isSelected ? 'var(--accent)' : 'var(--muted)' }}
                    >
                      <Clock size={16} style={{ color: isSelected ? '#fff' : 'var(--text-2)' }} />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2 mb-1">
                        <span className="font-semibold text-lg" style={{ color: isSelected ? 'var(--accent)' : 'var(--text)' }}>
                          {opt.label}
                        </span>
                        <span className="text-sm" style={{ color: 'var(--text-3)' }}>{opt.sublabel}</span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>{desc}</p>
                    </div>
                  </ToggleGroup.Item>
                );
              })}
            </ToggleGroup.Root>

            <button
              onClick={handleSubmit}
              className="flex items-center gap-2 rounded-xl px-8 py-3.5 text-sm font-semibold transition-all md:w-auto w-full justify-center"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              {mode === 'learn' ? <GraduationCap size={15} /> : <Brain size={15} />}
              {mode === 'learn' ? 'Start Learning' : 'Start Quiz'}
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
