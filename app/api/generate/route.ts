import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { QUIZ_TOOL, SYSTEM_PROMPT } from '@/lib/data';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { topic, count } = await req.json();

  if (!topic?.trim()) {
    return NextResponse.json({ error: 'Please provide a topic.' }, { status: 400 });
  }

  const questionCount = [5, 10, 20].includes(count) ? count : 10;
  const userMessage = `Generate a ${questionCount}-question quiz about: ${topic}`;

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
      tools: [QUIZ_TOOL],
      tool_choice: { type: 'tool', name: 'generate_quiz' },
    });

    const toolUse = response.content.find(b => b.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('No quiz generated');
    }

    return NextResponse.json(toolUse.input);
  } catch (err) {
    const message = err instanceof Anthropic.APIError ? err.message : 'Failed to generate quiz';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
