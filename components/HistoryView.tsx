'use client';
import { useEffect, useState } from 'react';
import * as Accordion from '@radix-ui/react-accordion';
import * as ScrollArea from '@radix-ui/react-scroll-area';
import {
  ArrowLeft, ChevronDown, GraduationCap, Brain,
  Trophy, BookMarked, Star, Flame, Sprout, CheckCircle, XCircle,
} from 'lucide-react';
import { getHistory, groupHistory, formatDate, type SubjectGroup } from '@/lib/history';
import { getPerformanceTier } from '@/lib/data';
import clsx from 'clsx';

const TIER_ICONS: Record<string, React.ReactNode> = {
  BookMarked: <BookMarked size={13} />,
  Sprout:     <Sprout size={13} />,
  Star:       <Star size={13} />,
  Flame:      <Flame size={13} />,
  Trophy:     <Trophy size={13} />,
};

function ScoreBadge({ pct }: { pct: number }) {
  const tier = getPerformanceTier(pct);
  return (
    <span
      className={clsx('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full', tier.color, tier.bg)}
    >
      {TIER_ICONS[tier.iconName]}
      {pct}%
    </span>
  );
}

interface Props {
  onBack: () => void;
}

export default function HistoryView({ onBack }: Props) {
  const [groups, setGroups] = useState<SubjectGroup[]>([]);

  useEffect(() => {
    setGroups(groupHistory(getHistory()));
  }, []);

  const totalEntries = groups.reduce((s, g) => s + g.entries.length, 0);

  return (
    <div className="min-h-dvh flex flex-col">
      {/* Header */}
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
        <span className="text-sm font-semibold md:hidden" style={{ color: 'var(--text)' }}>History</span>
        <span className="text-xs" style={{ color: 'var(--text-3)' }}>{totalEntries} session{totalEntries !== 1 ? 's' : ''}</span>
      </div>

      <ScrollArea.Root className="flex-1">
        <ScrollArea.Viewport className="w-full">
          <div className="px-6 py-8 max-w-6xl mx-auto pb-10">
            <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--text)' }}>Learning History</h1>
            <div className="md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-4 space-y-3 md:space-y-0">

            {groups.length === 0 && (
              <div className="flex flex-col items-center justify-center py-24 space-y-3">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ background: 'var(--muted)' }}
                >
                  <BookMarked size={22} style={{ color: 'var(--text-3)' }} />
                </div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-2)' }}>No sessions yet</p>
                <p className="text-xs text-center max-w-xs" style={{ color: 'var(--text-3)' }}>
                  Complete a lesson or quiz and it will appear here, grouped by subject.
                </p>
              </div>
            )}

            <Accordion.Root type="multiple" defaultValue={groups.map(g => g.subject)}>
              {groups.map(group => (
                <Accordion.Item
                  key={group.subject}
                  value={group.subject}
                  className="rounded-2xl overflow-hidden mb-3"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <Accordion.Header>
                    <Accordion.Trigger
                      className="w-full flex items-center justify-between px-4 py-3.5 text-left outline-none cursor-pointer transition-colors group"
                      style={{ background: 'var(--surface)' }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                              {group.subject}
                            </span>
                            {group.bestScore !== null && (
                              <ScoreBadge pct={group.bestScore} />
                            )}
                          </div>
                          <p className="text-xs" style={{ color: 'var(--text-3)' }}>
                            {[
                              group.learnCount > 0 && `${group.learnCount} lesson${group.learnCount > 1 ? 's' : ''}`,
                              group.quizCount > 0 && `${group.quizCount} quiz${group.quizCount > 1 ? 'zes' : ''}`,
                            ].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                      </div>

                      <ChevronDown
                        size={15}
                        style={{ color: 'var(--text-3)', transition: 'transform 200ms' }}
                        className="group-data-[state=open]:rotate-180"
                      />
                    </Accordion.Trigger>
                  </Accordion.Header>

                  <Accordion.Content
                    className="overflow-hidden"
                    style={{ background: 'var(--muted)' }}
                  >
                    <div className="px-4 py-2 space-y-1.5 pb-3">
                      {group.entries.map(entry => (
                        <div
                          key={entry.id}
                          className="flex items-start gap-3 rounded-xl px-3 py-3"
                          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
                        >
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
                            style={{
                              background: entry.type === 'learn' ? 'var(--accent-light)' : 'var(--muted)',
                            }}
                          >
                            {entry.type === 'learn'
                              ? <GraduationCap size={13} style={{ color: 'var(--accent)' }} />
                              : <Brain size={13} style={{ color: 'var(--text-2)' }} />
                            }
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium leading-snug truncate" style={{ color: 'var(--text)' }}>
                              {entry.lessonTitle ?? entry.quizTitle ?? entry.topic}
                            </p>
                            <p className="text-xs mt-0.5" style={{ color: 'var(--text-3)' }}>
                              {formatDate(entry.date)}
                            </p>
                          </div>

                          <div className="flex-shrink-0">
                            {entry.type === 'quiz' && entry.pct !== undefined ? (
                              <ScoreBadge pct={entry.pct} />
                            ) : entry.type === 'quiz' && entry.pct === undefined ? (
                              <span className="text-xs" style={{ color: 'var(--text-3)' }}>No score</span>
                            ) : (
                              <CheckCircle size={14} style={{ color: 'var(--success)' }} />
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Accordion.Content>
                </Accordion.Item>
              ))}
            </Accordion.Root>
            </div>
          </div>
        </ScrollArea.Viewport>
        <ScrollArea.Scrollbar orientation="vertical" className="w-1.5 p-0.5">
          <ScrollArea.Thumb style={{ background: 'var(--border)', borderRadius: 9999 }} />
        </ScrollArea.Scrollbar>
      </ScrollArea.Root>
    </div>
  );
}
