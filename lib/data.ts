import type { TimeValue } from './types';

// ── Loading messages ──────────────────────────────────────────────────────────

export const LOADING_MESSAGES: Record<'quiz' | 'learn', string[]> = {
  quiz: [
    'Crafting your questions…',
    'Digging through the archives…',
    'Consulting the experts…',
    'Building your quiz…',
    'Almost ready…',
  ],
  learn: [
    'Preparing your lesson…',
    'Gathering the key ideas…',
    'Drawing up the diagram…',
    'Putting it all together…',
    'Almost ready…',
  ],
};

// ── Time options ──────────────────────────────────────────────────────────────

export const TIME_OPTIONS: {
  value: TimeValue;
  label: string;
  sublabel: string;
  quizCount: number;
  learnDepth: 'short' | 'standard' | 'deep';
  learnDesc: string;
  quizDesc: string;
}[] = [
  {
    value: '5',
    label: '5 min',
    sublabel: 'Quick',
    quizCount: 5,
    learnDepth: 'short',
    learnDesc: '4 key facts, 2 sections',
    quizDesc: '5 questions',
  },
  {
    value: '10',
    label: '10 min',
    sublabel: 'Standard',
    quizCount: 10,
    learnDepth: 'standard',
    learnDesc: '5 key facts, 3 sections + diagram',
    quizDesc: '10 questions',
  },
  {
    value: '20',
    label: '20 min',
    sublabel: 'Deep dive',
    quizCount: 20,
    learnDepth: 'deep',
    learnDesc: '6 key facts, 5 sections + diagram',
    quizDesc: '20 questions',
  },
];

// ── Performance tiers ─────────────────────────────────────────────────────────

export const PERFORMANCE_TIERS = [
  { min: 0,  max: 39,  label: 'Keep going',    iconName: 'BookMarked', color: 'text-amber-600',   bg: 'bg-amber-50'   },
  { min: 40, max: 59,  label: 'Getting there', iconName: 'Sprout',     color: 'text-yellow-600',  bg: 'bg-yellow-50'  },
  { min: 60, max: 79,  label: 'Solid effort',  iconName: 'Star',       color: 'text-indigo-600',  bg: 'bg-indigo-50'  },
  { min: 80, max: 94,  label: 'Impressive',    iconName: 'Flame',      color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { min: 95, max: 100, label: 'Outstanding',   iconName: 'Trophy',     color: 'text-violet-600',  bg: 'bg-violet-50'  },
];

export function getPerformanceTier(pct: number) {
  return PERFORMANCE_TIERS.find(t => pct >= t.min && pct <= t.max) ?? PERFORMANCE_TIERS[0];
}

// ── Quiz tool ─────────────────────────────────────────────────────────────────

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
            options: { type: 'array', items: { type: 'string' }, description: 'Exactly 4 answer options' },
            correct_index: { type: 'integer', description: 'Zero-based index of the correct option' },
            explanation: { type: 'string', description: 'Brief explanation of why the correct answer is right (1-2 sentences)' },
          },
          required: ['id', 'question', 'options', 'correct_index', 'explanation'],
        },
      },
    },
    required: ['title', 'questions'],
  },
};

export const QUIZ_SYSTEM_PROMPT = `You are a quiz generator for a micro-learning app.

Rules:
- Generate exactly the number of questions requested
- Always generate exactly 4 options per question
- Vary difficulty: mix easy, medium, and hard questions
- Make distractors plausible — avoid obviously wrong answers
- Randomize the position of the correct answer
- Write clear, unambiguous questions
- Keep explanations concise and genuinely educational (1-2 sentences)
- Make questions engaging and interesting, not dry`;

// ── Learn tool ────────────────────────────────────────────────────────────────

export const LEARN_TOOL = {
  name: 'generate_lesson',
  description: 'Generate a structured micro-lesson with a visual diagram',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string', description: 'Short, engaging lesson title (max 8 words)' },
      summary: { type: 'string', description: '2-3 sentence overview of the topic' },
      keyFacts: {
        type: 'array',
        items: { type: 'string' },
        description: 'Key takeaway facts, each a single clear sentence',
      },
      sections: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            heading: { type: 'string', description: 'Section heading (3-5 words)' },
            content: { type: 'string', description: '3-5 sentences explaining this aspect' },
          },
          required: ['heading', 'content'],
        },
      },
      diagram: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          type: {
            type: 'string',
            enum: ['flowchart', 'mindmap', 'timeline'],
            description: 'flowchart for processes, mindmap for concepts, timeline for historical events',
          },
          code: {
            type: 'string',
            description: `Valid Mermaid code. Examples:
flowchart TD: "flowchart TD\\n  A[\\"Step 1\\"] --> B[\\"Step 2\\"]\\n  B --> C[\\"Step 3\\"]"
mindmap: "mindmap\\n  root((Topic))\\n    Concept A\\n      Detail 1\\n    Concept B\\n      Detail 2"
timeline: "timeline\\n  title Key Events\\n  section Era\\n    Year : Event"
Keep labels short (max 5 words). Use double quotes in flowchart node labels.`,
          },
        },
        required: ['title', 'type', 'code'],
      },
    },
    required: ['title', 'summary', 'keyFacts', 'sections', 'diagram'],
  },
};

type LearnDepth = 'short' | 'standard' | 'deep';

const DEPTH_INSTRUCTIONS: Record<LearnDepth, string> = {
  short:    'Create a CONCISE lesson: exactly 4 key facts and exactly 2 sections. Keep each section to 3 sentences.',
  standard: 'Create a STANDARD lesson: exactly 5 key facts and exactly 3 sections. Include a diagram.',
  deep:     'Create a COMPREHENSIVE lesson: exactly 6 key facts and exactly 5 sections with depth. Include a diagram.',
};

export function getLearnSystemPrompt(depth: LearnDepth): string {
  return `You are a micro-lesson generator for a mobile learning app. Create concise, engaging lessons that teach real knowledge.

${DEPTH_INSTRUCTIONS[depth]}

Style rules:
- Write for curious adults — insightful, not textbook-dry
- Each section should teach something genuinely interesting
- Key facts should be memorable and concrete
- The diagram must use valid Mermaid syntax — keep node labels short, avoid special characters
- For flowchart: use TD direction, wrap labels in double quotes inside square brackets
- For mindmap: use proper indentation, start with root((Topic))
- For timeline: group events into named sections
- Choose the diagram type that best fits the topic's structure`;
}
