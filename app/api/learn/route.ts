import Anthropic from '@anthropic-ai/sdk';
import { NextRequest, NextResponse } from 'next/server';
import { LEARN_TOOL, LEARN_SYSTEM_PROMPT } from '@/lib/data';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { topic } = await req.json();

  if (!topic?.trim()) {
    return NextResponse.json({ error: 'Please provide a topic.' }, { status: 400 });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 4096,
      system: LEARN_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: `Create a micro-lesson about: ${topic}` }],
      tools: [LEARN_TOOL],
      tool_choice: { type: 'tool', name: 'generate_lesson' },
    });

    const toolUse = response.content.find(b => b.type === 'tool_use');
    if (!toolUse || toolUse.type !== 'tool_use') {
      throw new Error('No lesson generated');
    }

    return NextResponse.json(toolUse.input);
  } catch (err) {
    const message = err instanceof Anthropic.APIError ? err.message : 'Failed to generate lesson';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
