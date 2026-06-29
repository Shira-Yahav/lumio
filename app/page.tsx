'use client';
import { useState, useCallback } from 'react';
import type { AppState, QuizSettings } from '@/lib/types';
import HomeWizard from '@/components/HomeWizard';
import QuizView from '@/components/QuizView';
import ResultsView from '@/components/ResultsView';
import LearnView from '@/components/LearnView';
import LoadingView from '@/components/LoadingView';
import HistoryView from '@/components/HistoryView';

export default function Page() {
  const [state, setState] = useState<AppState>({ view: 'home' });

  async function fetchQuiz(settings: QuizSettings) {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: settings.topic, time: settings.time }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  async function fetchLesson(settings: QuizSettings) {
    const res = await fetch('/api/learn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: settings.topic, time: settings.time }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  const handleQuiz = useCallback(async (settings: QuizSettings) => {
    setState({ view: 'quiz-loading', settings });
    try {
      const quiz = await fetchQuiz(settings);
      setState({ view: 'quiz', quiz, settings, answers: new Array(quiz.questions.length).fill(null), currentQ: 0 });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate quiz.');
      setState({ view: 'home' });
    }
  }, []);

  const handleLearn = useCallback(async (settings: QuizSettings) => {
    setState({ view: 'learn-loading', settings });
    try {
      const lesson = await fetchLesson(settings);
      setState({ view: 'learn', lesson, settings });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate lesson.');
      setState({ view: 'home' });
    }
  }, []);

  const handleQuizFromLearn = useCallback(async () => {
    if (state.view !== 'learn') return;
    const { settings, lesson } = state;
    setState({ view: 'quiz-loading', settings });
    try {
      const quiz = await fetchQuiz(settings);
      setState({ view: 'quiz', quiz, settings, answers: new Array(quiz.questions.length).fill(null), currentQ: 0 });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate quiz.');
      setState({ view: 'learn', lesson, settings });
    }
  }, [state]);

  const handleLearnMore = useCallback(async () => {
    if (state.view !== 'results') return;
    const { settings, quiz, answers } = state;
    setState({ view: 'learn-loading', settings });
    try {
      const lesson = await fetchLesson(settings);
      setState({ view: 'learn', lesson, settings });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate lesson.');
      setState({ view: 'results', quiz, settings, answers });
    }
  }, [state]);

  const handleAnswer = useCallback((questionIdx: number, optionIdx: number) => {
    setState(prev => {
      if (prev.view !== 'quiz') return prev;
      const answers = [...prev.answers];
      answers[questionIdx] = optionIdx;
      return { ...prev, answers };
    });
  }, []);

  const handleNext = useCallback(() => {
    setState(prev => {
      if (prev.view !== 'quiz') return prev;
      return { ...prev, currentQ: Math.min(prev.currentQ + 1, prev.quiz.questions.length - 1) };
    });
  }, []);

  const handlePrev = useCallback(() => {
    setState(prev => {
      if (prev.view !== 'quiz') return prev;
      return { ...prev, currentQ: Math.max(prev.currentQ - 1, 0) };
    });
  }, []);

  const handleSubmit = useCallback(() => {
    setState(prev => {
      if (prev.view !== 'quiz') return prev;
      const unanswered = prev.answers.filter(a => a === null).length;
      if (unanswered > 0 && !window.confirm(`${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`)) {
        return prev;
      }
      return { view: 'results', quiz: prev.quiz, settings: prev.settings, answers: prev.answers };
    });
  }, []);

  const handleRetry = useCallback(() => {
    setState(prev => {
      if (prev.view !== 'results') return prev;
      return { view: 'quiz', quiz: prev.quiz, settings: prev.settings, answers: new Array(prev.quiz.questions.length).fill(null), currentQ: 0 };
    });
  }, []);

  const handleBack = useCallback(() => setState({ view: 'home' }), []);
  const handleHistory = useCallback(() => setState({ view: 'history' }), []);

  if (state.view === 'home')         return <HomeWizard onLearn={handleLearn} onQuiz={handleQuiz} onHistory={handleHistory} />;
  if (state.view === 'history')      return <HistoryView onBack={handleBack} />;
  if (state.view === 'quiz-loading') return <LoadingView settings={state.settings} mode="quiz" />;
  if (state.view === 'learn-loading') return <LoadingView settings={state.settings} mode="learn" />;

  if (state.view === 'quiz') {
    return (
      <QuizView
        quiz={state.quiz} answers={state.answers} currentQ={state.currentQ}
        onAnswer={handleAnswer} onNext={handleNext} onPrev={handlePrev}
        onSubmit={handleSubmit} onBack={handleBack}
      />
    );
  }

  if (state.view === 'results') {
    return (
      <ResultsView
        quiz={state.quiz} answers={state.answers} settings={state.settings}
        onRetry={handleRetry} onNewTopic={handleBack}
        onLearnMore={handleLearnMore} onHistory={handleHistory}
      />
    );
  }

  if (state.view === 'learn') {
    return (
      <LearnView
        lesson={state.lesson} settings={state.settings}
        onQuiz={handleQuizFromLearn} onBack={handleBack}
      />
    );
  }
}
