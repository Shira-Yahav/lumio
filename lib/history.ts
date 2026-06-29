import type { HistoryEntry } from './types';

const HISTORY_KEY = 'lumio_history';
const MAX_ENTRIES = 200;

export function getHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(HISTORY_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function addHistoryEntry(entry: Omit<HistoryEntry, 'id' | 'date'>): void {
  if (typeof window === 'undefined') return;
  try {
    const history = getHistory();
    const newEntry: HistoryEntry = {
      ...entry,
      id: Math.random().toString(36).slice(2) + Date.now().toString(36),
      date: Date.now(),
    };
    const updated = [newEntry, ...history].slice(0, MAX_ENTRIES);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export interface SubjectGroup {
  subject: string;
  entries: HistoryEntry[];
  quizCount: number;
  learnCount: number;
  bestScore: number | null; // percentage
  lastDate: number;
}

export function groupHistory(history: HistoryEntry[]): SubjectGroup[] {
  const map = new Map<string, HistoryEntry[]>();
  for (const entry of history) {
    const s = entry.subject || 'General';
    if (!map.has(s)) map.set(s, []);
    map.get(s)!.push(entry);
  }

  return Array.from(map.entries())
    .map(([subject, entries]) => {
      const quizEntries = entries.filter(e => e.type === 'quiz' && e.pct !== undefined);
      const bestScore = quizEntries.length
        ? Math.max(...quizEntries.map(e => e.pct!))
        : null;
      return {
        subject,
        entries,
        quizCount: quizEntries.length,
        learnCount: entries.filter(e => e.type === 'learn').length,
        bestScore,
        lastDate: Math.max(...entries.map(e => e.date)),
      };
    })
    .sort((a, b) => b.lastDate - a.lastDate);
}

export function formatDate(ts: number): string {
  const d = new Date(ts);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
