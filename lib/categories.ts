import {
  Telescope, ScrollText, Cpu, Globe2, Palette, Brain,
  Leaf, TrendingUp, BookOpen, HeartPulse, type LucideIcon,
} from 'lucide-react';

export interface Category {
  icon: LucideIcon;
  name: string;
  prompt: string;
  subject: string;
}

export interface CategoryGroup {
  label: string;
  value: string;
  categories: Category[];
}

export const CATEGORY_GROUPS: CategoryGroup[] = [
  {
    label: 'Science & Nature',
    value: 'science',
    categories: [
      { icon: Telescope, name: 'Space & Science', prompt: 'fascinating facts about space, physics and modern science', subject: 'Science' },
      { icon: Leaf,      name: 'Nature',          prompt: 'biology, ecology, animals and the natural world',        subject: 'Nature' },
      { icon: HeartPulse, name: 'Human Body',     prompt: 'human anatomy, biology and how the body works',          subject: 'Health' },
    ],
  },
  {
    label: 'Culture & Ideas',
    value: 'culture',
    categories: [
      { icon: ScrollText, name: 'History',      prompt: 'major historical events, empires and turning points in world history', subject: 'History' },
      { icon: Palette,    name: 'Arts & Culture', prompt: 'art history, famous artists, music and cinema',                      subject: 'Arts' },
      { icon: BookOpen,   name: 'Literature',   prompt: 'classic and modern literature, authors and famous works',              subject: 'Literature' },
      { icon: Brain,      name: 'Philosophy',   prompt: 'philosophy, ethics, logic and the great thinkers',                    subject: 'Philosophy' },
    ],
  },
  {
    label: 'Modern World',
    value: 'modern',
    categories: [
      { icon: Cpu,        name: 'Technology', prompt: 'how computers, the internet and modern software works',      subject: 'Technology' },
      { icon: TrendingUp, name: 'Finance',    prompt: 'personal finance, economics and investing fundamentals',     subject: 'Finance' },
      { icon: Globe2,     name: 'World & Geo', prompt: 'world geography, countries, capitals and cultures',         subject: 'Geography' },
    ],
  },
];

export const ALL_CATEGORIES: Category[] = CATEGORY_GROUPS.flatMap(g => g.categories);

export function inferSubject(topic: string): string {
  const t = topic.toLowerCase();
  if (/space|star|planet|physics|quantum|chemistry|math|science|universe|cosm|astro|atom/.test(t)) return 'Science';
  if (/history|ancient|war|empire|revolution|century|medieval|civilization|roman|greek|dynasty/.test(t)) return 'History';
  if (/tech|software|code|computer|internet|ai|data|programming|algorithm|digital|cyber/.test(t)) return 'Technology';
  if (/art|music|film|cinema|painting|culture|design|architecture|theatre|dance/.test(t)) return 'Arts';
  if (/philosophy|ethics|logic|mind|consciousness|plato|stoic|kant|moral|existential/.test(t)) return 'Philosophy';
  if (/nature|animal|ecology|plant|evolution|species|climate|environment|ocean|forest/.test(t)) return 'Nature';
  if (/finance|money|invest|econom|business|market|stock|banking|trade|wealth/.test(t)) return 'Finance';
  if (/geography|country|capital|continent|mountain|river|nation|region|map/.test(t)) return 'Geography';
  if (/body|anatomy|health|medical|organ|brain|muscle|nutrition|biology|cell/.test(t)) return 'Health';
  if (/literature|book|novel|author|poem|story|writing|fiction|narrative/.test(t)) return 'Literature';
  return 'General';
}
