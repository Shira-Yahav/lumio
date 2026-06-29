'use client';
import { useState, useCallback } from 'react';
import type { AppState, QuizSettings } from '@/lib/types';
import HomeView from '@/components/HomeView';
import QuizView from '@/components/QuizView';
import ResultsView from '@/components/ResultsView';
import LearnView from '@/components/LearnView';
import LoadingView from '@/components/LoadingView';

export default function Page() {
  const [state, setState] = useState<AppState>({ view: 'home' });

  // ── Fetch helpers ──────────────────────────────────────────────────────────

  async function fetchQuiz(settings: QuizSettings) {
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  async function fetchLesson(settings: QuizSettings) {
    const res = await fetch('/api/learn', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: settings.topic }),
    });
    const data = await res.json();
    if (data.error) throw new Error(data.error);
    return data;
  }

  // ── Handlers ───────────────────────────────────────────────────────────────

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

  // From LearnView → start a quiz on the same topic
  const handleQuizFromLearn = useCallback(async () => {
    if (state.view !== 'learn') return;
    const settings = state.settings;
    setState({ view: 'quiz-loading', settings });
    try {
      const quiz = await fetchQuiz(settings);
      setState({ view: 'quiz', quiz, settings, answers: new Array(quiz.questions.length).fill(null), currentQ: 0 });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate quiz.');
      setState({ view: 'learn', lesson: (state as Extract<AppState, { view: 'learn' }>).lesson, settings });
    }
  }, [state]);

  // From ResultsView → teach me more about this topic
  const handleLearnMore = useCallback(async () => {
    if (state.view !== 'results') return;
    const settings = state.settings;
    setState({ view: 'learn-loading', settings });
    try {
      const lesson = await fetchLesson(settings);
      setState({ view: 'learn', lesson, settings });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate lesson.');
      setState({ view: 'results', quiz: (state as Extract<AppState, { view: 'results' }>).quiz, settings, answers: (state as Extract<AppState, { view: 'results' }>).answers });
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
      if (unanswered > 0) {
        const confirmed = window.confirm(
          `You have ${unanswered} unanswered question${unanswered > 1 ? 's' : ''}. Submit anyway?`
        );
        if (!confirmed) return prev;
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

  // ── Render ─────────────────────────────────────────────────────────────────

  if (state.view === 'home') {
    return <HomeView onLearn={handleLearn} onQuiz={handleQuiz} />;
  }

  if (state.view === 'quiz-loading') {
    return <LoadingView settings={state.settings} mode="quiz" />;
  }

  if (state.view === 'learn-loading') {
    return <LoadingView settings={state.settings} mode="learn" />;
  }

  if (state.view === 'quiz') {
    return (
      <QuizView
        quiz={state.quiz}
        answers={state.answers}
        currentQ={state.currentQ}
        onAnswer={handleAnswer}
        onNext={handleNext}
        onPrev={handlePrev}
        onSubmit={handleSubmit}
        onBack={handleBack}
      />
    );
  }

  if (state.view === 'results') {
    return (
      <ResultsView
        quiz={state.quiz}
        answers={state.answers}
        onRetry={handleRetry}
        onNewTopic={handleBack}
        onLearnMore={handleLearnMore}
      />
    );
  }

  if (state.view === 'learn') {
    return (
      <LearnView
        lesson={state.lesson}
        settings={state.settings}
        onQuiz={handleQuizFromLearn}
        onBack={handleBack}
      />
    );
  }
}
