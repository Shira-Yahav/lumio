# AI Quiz Generator

**Live demo:** [lumio-wheat.vercel.app](https://lumio-wheat.vercel.app/) &nbsp;|&nbsp; **GitHub:** [Shira-Yahav/QuizApp](https://github.com/Shira-Yahav/QuizApp)

---

## The Problem

Creating a good quiz takes time — not just to write the questions, but to craft plausible wrong answers, balance difficulty, and make sure the correct answer isn't always in the same position. Teachers, trainers, and students routinely spend 30–60 minutes building what should be a 5-minute task. And most AI-generated quizzes still feel cheap: obvious distractors, predictable answer placement, no explanations.

## The Solution

A web app where you describe what you want in plain English and get a fully interactive, well-structured quiz in seconds.

> *"10 questions about the French Revolution, mix of easy and hard"*
> *"5 tricky Python questions with 3 options each"*
> *"20 questions about world history"*

That's the entire interface. Type a prompt, click Generate, take the quiz.

---

## Features

### Natural Language Prompts
No forms, no dropdowns. Describe your quiz the way you'd tell a colleague. The app understands topic, question count, difficulty level, and number of answer options — all from free text.

### Educationally Sound Question Generation
The system is explicitly prompted to vary difficulty, randomize correct answer positions, and write distractors that are plausible — not obviously wrong. The result feels like a quiz a human wrote, not a template an algorithm filled in.

### Interactive Quiz Experience
- Animated progress bar tracks position through the quiz
- Answers persist as you navigate back and forth between questions
- Unanswered question warning before submission so nothing is accidentally skipped

### Instant Results with Explanations
Scoring is immediate. Every question shows whether you got it right, what the correct answer was if you didn't, and a concise explanation of *why* — so the quiz is also a learning tool, not just a test.

### "Generate New Quiz" Flow
One click resets the entire state and returns to the prompt screen. No page reload, no lost context.

---

## Screenshots

*Coming soon — see the [live demo](https://lumio-wheat.vercel.app/) to explore the app.*

---

## Technical Decisions

### Tool Use for Structured Output
The app uses the Anthropic tool use API (`tool_choice: { type: "tool", name: "generate_quiz" }`) rather than asking the model to return JSON and parsing it. This forces the model to populate a strict schema — title, questions, options, correct index, explanation — with zero chance of format drift, markdown leakage, or hallucinated field names. It's the difference between hoping the model returns valid JSON and guaranteeing it.

### Claude Sonnet for the Right Cost/Intelligence Trade-off
Quiz generation requires nuanced reasoning (plausible distractors, difficulty calibration, accurate facts) but not extended context or complex tool chains. Claude Sonnet hits the sweet spot: fast enough to feel snappy, capable enough to produce genuinely good questions, and cost-efficient at scale.

### System Prompt Engineering
The system prompt isn't generic. It encodes specific educational quality rules:

- Vary difficulty across the set
- Make wrong answers plausible, not obviously false
- Randomize correct answer position (models default to putting the right answer first or last)
- Default sensible values (10 questions, 4 options) so users don't have to specify everything

This is where most AI quiz tools fall flat — they don't encode these constraints, so the output feels machine-generated.

### Flask + Vanilla JS — No Build Pipeline
The backend is Flask with three routes: serve the HTML, handle the generate API, done. The frontend is vanilla JavaScript — no React, no bundler, no `node_modules`. This keeps the project deployable in one command (`gunicorn app:app`), readable without a framework mental model, and fast to iterate on. The right tool for a focused, single-feature app.

### Client-Side Scoring
Once the quiz is generated, all interaction — question rendering, answer selection, scoring, results breakdown — runs entirely in the browser. The server handles one API call per session. This means zero server load during quiz-taking and instant response to every user action.

### XSS-Safe HTML Rendering
Quiz content (questions, options, explanations) is rendered via `element.textContent`, not `innerHTML`. A dedicated `escapeHtml` utility handles any cases where dynamic content is inserted into HTML strings. User-supplied prompt text never reaches the DOM unescaped.

---

## Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python, Flask |
| AI | Anthropic Claude Sonnet via tool use |
| Frontend | Vanilla JavaScript, HTML, CSS |
| Production server | Gunicorn |

---

## Running Locally

```bash
git clone https://github.com/Shira-Yahav/QuizApp.git
cd QuizApp
pip install -r requirements.txt
export ANTHROPIC_API_KEY=your_key_here
python app.py
```

Open [http://localhost:5001](http://localhost:5001).
