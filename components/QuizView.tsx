'use client';
import { useEffect, useCallback } from 'react';
import * as Progress from '@radix-ui/react-progress';
import * as RadioGroup from '@radix-ui/react-radio-group';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import type { QuizData } from '@/lib/types';
import clsx from 'clsx';

const OPTION_LABELS = ['A', 'B', 'C', 'D'];

interface Props {
  quiz: QuizData;
  answers: (number | null)[];
  currentQ: number;
  onAnswer: (questionIdx: number, optionIdx: number) => void;
  onNext: () => void;
  onPrev: () => void;
  onSubmit: () => void;
  onBack: () => void;
}

export default function QuizView({ quiz, answers, currentQ, onAnswer, onNext, onPrev, onSubmit, onBack }: Props) {
  const total = quiz.questions.length;
  const q = quiz.questions[currentQ];
  const progress = ((currentQ + 1) / total) * 100;
  const isLast = currentQ === total - 1;
  const answeredCount = answers.filter(a => a !== null).length;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (['1','2','3','4'].includes(e.key)) {
      const idx = parseInt(e.key) - 1;
      if (idx < q.options.length) onAnswer(currentQ, idx);
    }
    if (e.key === 'ArrowRight' && !isLast) onNext();
    if (e.key === 'ArrowLeft' && currentQ > 0) onPrev();
    if (e.key === 'Enter' && isLast) onSubmit();
  }, [q, currentQ, isLast, onAnswer, onNext, onPrev, onSubmit]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Top bar */}
      <div
        className="flex items-center justify-between px-4 py-3 sticky top-0 z-10"
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

        <div className="text-center">
          <p className="text-xs font-medium" style={{ color: 'var(--text-3)' }}>
            {currentQ + 1} / {total}
          </p>
        </div>

        <div
          className="text-xs px-2 py-1 rounded-full font-medium"
          style={{
            background: 'var(--accent-light)',
            color: 'var(--accent)',
          }}
        >
          {answeredCount}/{total} done
        </div>
      </div>

      {/* Progress */}
      <div className="px-4 pt-3 pb-1">
        <Progress.Root value={progress} className="overflow-hidden rounded-full h-1" style={{ background: 'var(--border)' }}>
          <Progress.Indicator
            className="h-full rounded-full transition-all duration-500"
            style={{
              background: 'var(--accent)',
              transform: `translateX(-${100 - progress}%)`,
            }}
          />
        </Progress.Root>

        {/* Question dots */}
        <div className="flex gap-1 mt-2 justify-center flex-wrap">
          {quiz.questions.map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full transition-all"
              style={{
                background: i === currentQ
                  ? 'var(--accent)'
                  : answers[i] !== null
                  ? '#a5b4fc'
                  : 'var(--border)',
              }}
            />
          ))}
        </div>
      </div>

      {/* Question content */}
      <div className="flex-1 px-4 py-6 max-w-lg mx-auto w-full space-y-6 view-enter" key={currentQ}>
        {/* Quiz title */}
        <p className="text-xs font-medium uppercase tracking-wider" style={{ color: 'var(--text-3)' }}>
          {quiz.title}
        </p>

        {/* Question */}
        <div
          className="rounded-2xl p-5"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <p className="text-base font-semibold leading-relaxed" style={{ color: 'var(--text)' }}>
            {q.question}
          </p>
        </div>

        {/* Options */}
        <RadioGroup.Root
          value={answers[currentQ]?.toString() ?? ''}
          onValueChange={v => onAnswer(currentQ, parseInt(v))}
          className="space-y-2.5"
        >
          {q.options.map((opt, i) => {
            const isSelected = answers[currentQ] === i;
            return (
              <RadioGroup.Item
                key={i}
                value={i.toString()}
                className={clsx(
                  'w-full flex items-start gap-3 rounded-xl px-4 py-3.5 text-sm text-left transition-all outline-none cursor-pointer',
                  'border'
                )}
                style={{
                  background: isSelected ? 'var(--accent-light)' : 'var(--surface)',
                  borderColor: isSelected ? 'var(--accent)' : 'var(--border)',
                  color: isSelected ? 'var(--accent)' : 'var(--text)',
                  boxShadow: isSelected ? '0 0 0 1px var(--accent)' : 'none',
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-strong)';
                    e.currentTarget.style.background = 'var(--muted)';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border)';
                    e.currentTarget.style.background = 'var(--surface)';
                  }
                }}
              >
                <span
                  className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                  style={{
                    background: isSelected ? 'var(--accent)' : 'var(--muted)',
                    color: isSelected ? '#fff' : 'var(--text-2)',
                  }}
                >
                  {OPTION_LABELS[i]}
                </span>
                <span className="leading-relaxed pt-0.5">{opt}</span>
              </RadioGroup.Item>
            );
          })}
        </RadioGroup.Root>

        <p className="text-xs text-center" style={{ color: 'var(--text-3)' }}>
          Press 1–4 to answer · ← → to navigate
        </p>
      </div>

      {/* Navigation */}
      <div
        className="px-4 py-4 sticky bottom-0"
        style={{ background: 'var(--bg)', borderTop: '1px solid var(--border)' }}
      >
        <div className="max-w-lg mx-auto flex gap-2">
          <button
            onClick={onPrev}
            disabled={currentQ === 0}
            className="flex items-center gap-1.5 px-4 py-3 rounded-xl text-sm font-medium transition-all"
            style={{
              background: currentQ === 0 ? 'var(--muted)' : 'var(--surface)',
              color: currentQ === 0 ? 'var(--text-3)' : 'var(--text-2)',
              border: '1px solid var(--border)',
              cursor: currentQ === 0 ? 'not-allowed' : 'pointer',
            }}
          >
            <ArrowLeft size={14} />
            Prev
          </button>

          {isLast ? (
            <button
              onClick={onSubmit}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              <CheckCircle size={16} />
              Finish Quiz
            </button>
          ) : (
            <button
              onClick={onNext}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold transition-all"
              style={{ background: 'var(--accent)', color: '#fff' }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-hover)'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
            >
              Next
              <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
