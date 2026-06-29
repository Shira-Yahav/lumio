'use client';
import { useEffect, useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import {
  CheckCircle, XCircle, RotateCcw, Plus, GraduationCap,
  Trophy, BookMarked, Star, Flame, Sprout, ChevronDown, History,
} from 'lucide-react';
import type { QuizData, QuizSettings } from '@/lib/types';
import { getPerformanceTier } from '@/lib/data';
import { addHistoryEntry } from '@/lib/history';
import clsx from 'clsx';

const CIRCUMFERENCE = 2 * Math.PI * 44;

const TIER_ICONS: Record<string, React.ReactNode> = {
  BookMarked: <BookMarked size={14} />,
  Sprout:     <Sprout size={14} />,
  Star:       <Star size={14} />,
  Flame:      <Flame size={14} />,
  Trophy:     <Trophy size={14} />,
};

interface Props {
  quiz: QuizData;
  answers: (number | null)[];
  settings: QuizSettings;
  onRetry: () => void;
  onNewTopic: () => void;
  onLearnMore: () => void;
  onHistory: () => void;
}

export default function ResultsView({ quiz, answers, settings, onRetry, onNewTopic, onLearnMore, onHistory }: Props) {
  const [animated, setAnimated] = useState(false);

  const total = quiz.questions.length;
  const score = answers.reduce<number>((acc, a, i) => acc + (a === quiz.questions[i].correct_index ? 1 : 0), 0);
  const pct = Math.round((score / total) * 100);
  const tier = getPerformanceTier(pct);
  const dashOffset = CIRCUMFERENCE * (1 - (animated ? pct / 100 : 0));

  useEffect(() => {
    addHistoryEntry({
      topic: settings.topic,
      subject: settings.subject,
      type: 'quiz',
      quizTitle: quiz.title,
      score,
      total,
      pct,
    });
    const id = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-dvh flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6 view-enter">

        {/* Score ring */}
        <div className="flex flex-col items-center gap-4 py-4">
          <div className="relative w-[120px] h-[120px]">
            <svg width="120" height="120" className="score-ring">
              <circle cx="60" cy="60" r="44" strokeWidth="8" stroke="var(--border)" fill="none" />
              <circle
                cx="60" cy="60" r="44" strokeWidth="8" stroke="var(--accent)" fill="none"
                strokeLinecap="round"
                strokeDasharray={CIRCUMFERENCE}
                strokeDashoffset={dashOffset}
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.65,0,0.35,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{pct}%</span>
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className={clsx('inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold', tier.bg, tier.color)}>
              {TIER_ICONS[tier.iconName]}
              {tier.label}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              {score} of {total} correct
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={onRetry}
              className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all"
              style={{ background: 'var(--surface)', color: 'var(--text-2)', border: '1px solid var(--border)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-strong)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <RotateCcw size={14} />
              Try Again
            </button>
            <button
              onClick={onNewTopic}
              className="flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              <Plus size={14} />
              New Topic
            </button>
          </div>
          <button
            onClick={onLearnMore}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all"
            style={{ background: 'var(--accent-light)', color: 'var(--accent)', border: '1px solid #c7d2fe' }}
            onMouseEnter={e => e.currentTarget.style.background = '#e0e7ff'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--accent-light)'}
          >
            <GraduationCap size={14} />
            Teach me more about this
          </button>
          <button
            onClick={onHistory}
            className="w-full flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-medium transition-all"
            style={{ background: 'transparent', color: 'var(--text-3)', border: '1px solid var(--border)' }}
            onMouseEnter={e => { e.currentTarget.style.color = 'var(--text-2)'; e.currentTarget.style.borderColor = 'var(--border-strong)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-3)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <History size={14} />
            View learning history
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>Question breakdown</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        {/* Breakdown using Radix Accordion */}
        <div className="pb-8">
          <Accordion.Root type="single" collapsible className="space-y-2">
            {quiz.questions.map((q, i) => {
              const isCorrect = answers[i] === q.correct_index;
              const userAnswer = answers[i] !== null ? q.options[answers[i]!] : null;

              return (
                <Accordion.Item
                  key={i}
                  value={`q${i}`}
                  className="rounded-xl overflow-hidden"
                  style={{ border: `1px solid ${isCorrect ? '#a7f3d0' : '#fca5a5'}` }}
                >
                  <Accordion.Header>
                    <Accordion.Trigger className="w-full flex items-start gap-3 px-4 py-3 text-left outline-none cursor-pointer group">
                      <div className="flex-shrink-0 mt-0.5">
                        {isCorrect
                          ? <CheckCircle size={15} style={{ color: 'var(--success)' }} />
                          : <XCircle size={15} style={{ color: 'var(--error)' }} />
                        }
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text)' }}>
                          <span className="mr-1.5 text-xs" style={{ color: 'var(--text-3)' }}>Q{i + 1}.</span>
                          {q.question}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
                          {isCorrect
                            ? q.options[q.correct_index]
                            : userAnswer ?? 'No answer'
                          }
                        </p>
                      </div>
                      <ChevronDown
                        size={14}
                        className="flex-shrink-0 mt-0.5 group-data-[state=open]:rotate-180 transition-transform"
                        style={{ color: 'var(--text-3)' }}
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content
                    className="overflow-hidden"
                    style={{ background: 'var(--muted)' }}
                  >
                    <div className="px-4 pt-2 pb-3 space-y-1.5">
                      {!isCorrect && (
                        <>
                          {userAnswer && (
                            <p className="text-xs" style={{ color: 'var(--error)' }}>
                              Your answer: {userAnswer}
                            </p>
                          )}
                          <p className="text-xs font-medium" style={{ color: 'var(--success)' }}>
                            Correct: {q.options[q.correct_index]}
                          </p>
                        </>
                      )}
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
                        {q.explanation}
                      </p>
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              );
            })}
          </Accordion.Root>
        </div>
      </div>
    </div>
  );
}
