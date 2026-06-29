'use client';
import { useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ArrowLeft, ArrowRight, Lightbulb, GraduationCap } from 'lucide-react';
import type { LearnData, QuizSettings } from '@/lib/types';
import { addHistoryEntry } from '@/lib/history';
import { TIME_OPTIONS } from '@/lib/data';

const MermaidDiagram = dynamic(() => import('./MermaidDiagram'), { ssr: false });

interface Props {
  lesson: LearnData;
  settings: QuizSettings;
  onQuiz: () => void;
  onBack: () => void;
}

export default function LearnView({ lesson, settings, onQuiz, onBack }: Props) {
  const timeOpt = TIME_OPTIONS.find(o => o.value === settings.time) ?? TIME_OPTIONS[1];

  useEffect(() => {
    addHistoryEntry({ topic: settings.topic, subject: settings.subject, type: 'learn', lessonTitle: lesson.title });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--bg)' }}>
      {/* Top bar */}
      <header
        className="flex items-center justify-between px-6 py-3.5 sticky top-0 z-10"
        style={{ background: 'var(--bg)', borderBottom: '1px solid var(--border)' }}
      >
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm transition-colors"
          style={{ color: 'var(--text-2)' }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--text-2)'}
        >
          <ArrowLeft size={15} />
          Back
        </button>
        <div
          className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full font-medium"
          style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
        >
          <GraduationCap size={11} />
          Lesson · {timeOpt.label}
        </div>
      </header>

      {/* Content */}
      <div className="flex-1 px-6 py-8 max-w-6xl mx-auto w-full">
        <div className="md:grid md:grid-cols-[1fr_320px] md:gap-10 md:items-start">

          {/* ── Main column ── */}
          <article className="space-y-7 view-enter">
            {/* Title */}
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
                {settings.topic}
              </p>
              <h1 className="text-2xl md:text-3xl font-bold leading-snug" style={{ color: 'var(--text)' }}>
                {lesson.title}
              </h1>
              <p className="text-base leading-relaxed" style={{ color: 'var(--text-2)' }}>
                {lesson.summary}
              </p>
            </div>

            {/* Key facts — mobile only (shows in sidebar on desktop) */}
            <div
              className="md:hidden rounded-2xl p-5 space-y-3"
              style={{ background: 'var(--accent-light)', border: '1px solid #c7d2fe' }}
            >
              <div className="flex items-center gap-2">
                <Lightbulb size={14} style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Key Facts</span>
              </div>
              {lesson.keyFacts.map((fact, i) => (
                <div key={i} className="flex gap-2.5 text-sm" style={{ color: 'var(--text)' }}>
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold" style={{ background: 'var(--accent)', color: '#fff' }}>
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{fact}</span>
                </div>
              ))}
            </div>

            {/* Sections */}
            {lesson.sections.map((section, i) => (
              <div key={i} className="space-y-3">
                <h2 className="text-lg font-semibold" style={{ color: 'var(--text)' }}>{section.heading}</h2>
                <p className="text-sm leading-relaxed md:text-base" style={{ color: 'var(--text-2)' }}>{section.content}</p>
                {i === 0 && lesson.diagram && (
                  <div className="mt-4">
                    <MermaidDiagram code={lesson.diagram.code} title={lesson.diagram.title} />
                  </div>
                )}
              </div>
            ))}

            {/* CTA — mobile only */}
            <div
              className="md:hidden rounded-2xl p-5 space-y-3 text-center"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>Ready to test what you just learned?</p>
              <button
                onClick={onQuiz}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all"
                style={{ background: 'var(--accent)', color: '#fff' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                Test Your Knowledge <ArrowRight size={15} />
              </button>
            </div>
            <div className="pb-8" />
          </article>

          {/* ── Sidebar (desktop only) ── */}
          <aside className="hidden md:block space-y-4 sticky top-20">
            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'var(--accent-light)', border: '1px solid #c7d2fe' }}
            >
              <div className="flex items-center gap-2">
                <Lightbulb size={14} style={{ color: 'var(--accent)' }} />
                <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--accent)' }}>Key Facts</span>
              </div>
              {lesson.keyFacts.map((fact, i) => (
                <div key={i} className="flex gap-2.5 text-sm" style={{ color: 'var(--text)' }}>
                  <span className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5" style={{ background: 'var(--accent)', color: '#fff' }}>
                    {i + 1}
                  </span>
                  <span className="leading-relaxed">{fact}</span>
                </div>
              ))}
            </div>

            <div
              className="rounded-2xl p-5 space-y-3"
              style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
            >
              <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                Ready to test what you just learned?
              </p>
              <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                {timeOpt.quizCount} questions · {settings.topic}
              </p>
              <button
                onClick={onQuiz}
                className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold transition-all"
                style={{ background: 'var(--accent)', color: '#fff' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
              >
                Test Your Knowledge <ArrowRight size={14} />
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
