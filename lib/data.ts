export const CATEGORIES = [
  { emoji: '🔭', name: 'Space & Science', prompt: 'fascinating facts about space, physics and modern science' },
  { emoji: '📜', name: 'History', prompt: 'major historical events, empires and turning points in world history' },
  { emoji: '💻', name: 'Technology', prompt: 'how computers, the internet and modern software works' },
  { emoji: '🌍', name: 'World & Geo', prompt: 'world geography, countries, capitals and cultures' },
  { emoji: '🎭', name: 'Arts & Culture', prompt: 'art history, famous artists, music and cinema' },
  { emoji: '🧠', name: 'Philosophy', prompt: 'philosophy, ethics, logic and the great thinkers' },
  { emoji: '🌿', name: 'Nature', prompt: 'biology, ecology, animals and the natural world' },
  { emoji: '💸', name: 'Finance', prompt: 'personal finance, economics and investing fundamentals' },
  { emoji: '📖', name: 'Literature', prompt: 'classic and modern literature, authors and famous works' },
  { emoji: '🧬', name: 'Human Body', prompt: 'human anatomy, biology and how the body works' },
];

export const LOADING_MESSAGES = [
  'Crafting your questions…',
  'Digging through the archives…',
  'Consulting the experts…',
  'Building your quiz…',
  'Thinking hard…',
  'Almost ready…',
];

export const PERFORMANCE_TIERS = [
  { min: 0,   max: 39,  label: 'Keep going!',    icon: '📚', color: 'text-amber-600',    bg: 'bg-amber-50'   },
  { min: 40,  max: 59,  label: 'Getting there',  icon: '🌱', color: 'text-yellow-600',   bg: 'bg-yellow-50'  },
  { min: 60,  max: 79,  label: 'Solid effort',   icon: '⭐', color: 'text-indigo-600',   bg: 'bg-indigo-50'  },
  { min: 80,  max: 94,  label: 'Impressive!',    icon: '🔥', color: 'text-emerald-600',  bg: 'bg-emerald-50' },
  { min: 95,  max: 100, label: 'Outstanding!',   icon: '🏆', color: 'text-violet-600',   bg: 'bg-violet-50'  },
];

export function getPerformanceTier(pct: number) {
  return PERFORMANCE_TIERS.find(t => pct >= t.min && pct <= t.max) ?? PERFORMANCE_TIERS[0];
}

export const QUIZ_TOOL = {
  name: 'generate_quiz',
  description: 'Generate a structured multiple-choice quiz',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string', description: 'A short, engaging title for the quiz (max 8 words)' },
      questions: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'integer', description: 'Question number starting from 1' },
            question: { type: 'string', description: 'The question text' },
            options: {
              type: 'array',
              items: { type: 'string' },
              description: 'The answer options',
            },
            correct_index: {
              type: 'integer',
              description: 'Zero-based index of the correct option',
            },
            explanation: {
              type: 'string',
              description: 'Brief explanation of why the correct answer is right (1-2 sentences)',
            },
          },
          required: ['id', 'question', 'options', 'correct_index', 'explanation'],
        },
      },
    },
    required: ['title', 'questions'],
  },
};

export const SYSTEM_PROMPT = `You are a quiz generator for a micro-learning app. Your goal is to help people learn quickly and enjoyably.

Rules:
- Generate exactly the number of questions requested
- Always generate exactly 4 options per question
- Vary difficulty: mix easy, medium, and hard questions
- Make distractors plausible — avoid obviously wrong answers
- Randomize the position of the correct answer (don't always put it first or last)
- Write clear, unambiguous questions
- Keep explanations concise and genuinely educational (1-2 sentences)
- Make questions engaging and interesting, not dry
- The title should be short and compelling`;
