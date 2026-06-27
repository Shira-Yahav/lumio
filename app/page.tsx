'use client';
import { useState, useCallback } from 'react';
import type { AppState, QuizSettings } from '@/lib/types';
import HomeView from '@/components/HomeView';
import QuizView from '@/components/QuizView';
import ResultsView from '@/components/ResultsView';
import LoadingView from '@/components/LoadingView';

export default function Page() {
  const [state, setState] = useState<AppState>({ view: 'home' });

  const handleGenerate = useCallback(async (settings: QuizSettings) => {
    setState({ view: 'loading', settings });

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setState({
        view: 'quiz',
        quiz: data,
        settings,
        answers: new Array(data.questions.length).fill(null),
        currentQ: 0,
      });
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to generate quiz. Please try again.');
      setState({ view: 'home' });
    }
  }, []);

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
      return {
        view: 'quiz',
        quiz: prev.quiz,
        settings: prev.settings,
        answers: new Array(prev.quiz.questions.length).fill(null),
        currentQ: 0,
      };
    });
  }, []);

  const handleNewTopic = useCallback(() => setState({ view: 'home' }), []);
  const handleBack = useCallback(() => setState({ view: 'home' }), []);

  if (state.view === 'home') {
    return <HomeView onGenerate={handleGenerate} />;
  }

  if (state.view === 'loading') {
    return <LoadingView settings={state.settings} />;
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
        onNewTopic={handleNewTopic}
      />
    );
  }
}
