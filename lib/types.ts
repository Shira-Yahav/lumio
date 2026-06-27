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

export type QuizCount = 5 | 10 | 20;

export interface QuizSettings {
  topic: string;
  count: QuizCount;
}

export type AppState =
  | { view: 'home' }
  | { view: 'loading'; settings: QuizSettings }
  | { view: 'quiz'; quiz: QuizData; settings: QuizSettings; answers: (number | null)[]; currentQ: number }
  | { view: 'results'; quiz: QuizData; settings: QuizSettings; answers: (number | null)[] };
