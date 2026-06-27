'use client';
import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, RotateCcw, Plus } from 'lucide-react';
import type { QuizData } from '@/lib/types';
import { getPerformanceTier } from '@/lib/data';
import clsx from 'clsx';

const CIRCUMFERENCE = 2 * Math.PI * 44; // radius = 44

interface Props {
  quiz: QuizData;
  answers: (number | null)[];
  onRetry: () => void;
  onNewTopic: () => void;
}

export default function ResultsView({ quiz, answers, onRetry, onNewTopic }: Props) {
  const [animated, setAnimated] = useState(false);
  const [expanded, setExpanded] = useState<number | null>(null);

  const total = quiz.questions.length;
  const score = answers.reduce<number>((acc, a, i) => acc + (a === quiz.questions[i].correct_index ? 1 : 0), 0);
  const pct = Math.round((score / total) * 100);
  const tier = getPerformanceTier(pct);
  const dashOffset = CIRCUMFERENCE * (1 - (animated ? pct / 100 : 0));

  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 150);
    return () => clearTimeout(id);
  }, []);

  return (
    <div className="min-h-dvh flex flex-col items-center px-4 py-8">
      <div className="w-full max-w-lg space-y-6 view-enter">

        {/* Score ring */}
        <div className="flex flex-col items-center gap-4 py-4">
          <svg width="120" height="120" className="score-ring">
            <circle
              className="score-ring-track"
              cx="60" cy="60" r="44"
              strokeWidth="8"
              stroke="var(--border)"
              fill="none"
            />
            <circle
              className="score-ring-fill"
              cx="60" cy="60" r="44"
              strokeWidth="8"
              stroke="var(--accent)"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={dashOffset}
              style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.65,0,0.35,1)' }}
            />
          </svg>

          <div
            className="absolute flex flex-col items-center"
            style={{ transform: 'translateY(-60px)' }}
          >
            <span className="text-3xl font-bold" style={{ color: 'var(--text)' }}>{pct}%</span>
          </div>

          <div className="text-center space-y-1">
            <div
              className={clsx('inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-semibold', tier.bg, tier.color)}
            >
              <span>{tier.icon}</span>
              {tier.label}
            </div>
            <p className="text-sm" style={{ color: 'var(--text-2)' }}>
              {score} out of {total} correct
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-2 gap-3">
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

        {/* Divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          <span className="text-xs" style={{ color: 'var(--text-3)' }}>Question breakdown</span>
          <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
        </div>

        {/* Breakdown */}
        <div className="space-y-2 pb-8">
          {quiz.questions.map((q, i) => {
            const isCorrect = answers[i] === q.correct_index;
            const userAnswer = answers[i] !== null ? q.options[answers[i]!] : null;
            const isOpen = expanded === i;

            return (
              <button
                key={i}
                onClick={() => setExpanded(isOpen ? null : i)}
                className="w-full rounded-xl p-4 text-left transition-all"
                style={{
                  background: 'var(--surface)',
                  border: `1px solid ${isCorrect ? '#a7f3d0' : '#fca5a5'}`,
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {isCorrect
                      ? <CheckCircle size={16} style={{ color: 'var(--success)' }} />
                      : <XCircle size={16} style={{ color: 'var(--error)' }} />
                    }
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <p className="text-sm font-medium leading-snug" style={{ color: 'var(--text)' }}>
                      <span className="mr-1.5" style={{ color: 'var(--text-3)' }}>Q{i + 1}.</span>
                      {q.question}
                    </p>

                    {isOpen && (
                      <div className="pt-2 space-y-1.5">
                        {!isCorrect && userAnswer && (
                          <p className="text-xs" style={{ color: 'var(--error)' }}>
                            Your answer: {userAnswer}
                          </p>
                        )}
                        {!isCorrect && (
                          <p className="text-xs font-medium" style={{ color: 'var(--success)' }}>
                            Correct: {q.options[q.correct_index]}
                          </p>
                        )}
                        {isCorrect && (
                          <p className="text-xs font-medium" style={{ color: 'var(--success)' }}>
                            ✓ {q.options[q.correct_index]}
                          </p>
                        )}
                        <p className="text-xs leading-relaxed" style={{ color: 'var(--text-2)' }}>
                          {q.explanation}
                        </p>
                      </div>
                    )}

                    {!isOpen && (
                      <p className="text-xs" style={{ color: isCorrect ? 'var(--success)' : 'var(--error)' }}>
                        {isCorrect ? `✓ ${q.options[q.correct_index]}` : `✗ ${userAnswer ?? 'No answer'}`}
                      </p>
                    )}
                  </div>
                  <span className="flex-shrink-0 text-xs" style={{ color: 'var(--text-3)' }}>
                    {isOpen ? '▲' : '▼'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
