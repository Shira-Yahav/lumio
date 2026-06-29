export interface Question {
  id: number;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
}

export interface QuizData {
  title: string;
  questions: Question[];
}

export interface DiagramData {
  title: string;
  type: 'flowchart' | 'mindmap' | 'timeline';
  code: string;
}

export interface LessonSection {
  heading: string;
  content: string;
}

export interface LearnData {
  title: string;
  summary: string;
  keyFacts: string[];
  sections: LessonSection[];
  diagram: DiagramData;
}

export type QuizCount = 5 | 10 | 20;

export interface QuizSettings {
  topic: string;
  count: QuizCount;
}

export type AppState =
  | { view: 'home' }
  | { view: 'quiz-loading'; settings: QuizSettings }
  | { view: 'learn-loading'; settings: QuizSettings }
  | { view: 'quiz'; quiz: QuizData; settings: QuizSettings; answers: (number | null)[]; currentQ: number }
  | { view: 'results'; quiz: QuizData; settings: QuizSettings; answers: (number | null)[] }
  | { view: 'learn'; lesson: LearnData; settings: QuizSettings };
