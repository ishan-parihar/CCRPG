/**
 * LLMClient — thin wrapper around a chat-completions endpoint.
 * Used for open-ended response evaluation in later-stage probes.
 */

import type { Stage } from '../../core/domain/Stage.js';

export interface LLMEvaluation {
  readonly score: number;
  readonly feedback: string;
  readonly inferredStage?: Stage;
  readonly confidence?: number;
}

const FALLBACK: LLMEvaluation = { score: 0.5, feedback: 'LLM unavailable' };

export async function evaluateResponse(
  prompt: string,
  rubric: string,
  playerResponse: string,
): Promise<LLMEvaluation> {
  const baseUrl = import.meta.env.VITE_LLM_BASE_URL as string | undefined;
  const apiKey = import.meta.env.VITE_LLM_API_KEY as string | undefined;
  const model = import.meta.env.VITE_LLM_MODEL as string | undefined;

  if (!baseUrl || !apiKey || apiKey === 'sk-placeholder' || !model) {
    return FALLBACK;
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: `You are a developmental psychology scoring rubric evaluator. ${rubric}\nIf evaluating a calibration probe, determine which developmental stage (Infrared, Magenta, Red, Amber, Orange, Green, Turquoise, White) the player response corresponds to and provide a confidence rating. Respond ONLY with JSON: {"score": <0-1>, "feedback": "<brief>", "inferredStage": "<stage>", "confidence": <0-1>}` },
          { role: 'user', content: `Prompt: ${prompt}\nPlayer response: ${playerResponse}` },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) return FALLBACK;

    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    const content = data.choices[0]?.message.content ?? '';
    const parsed = JSON.parse(content) as { score: number; feedback: string; inferredStage?: string; confidence?: number };
    const score = Math.max(0, Math.min(1, parsed.score));
    
    let inferredStage: Stage | undefined = undefined;
    if (parsed.inferredStage) {
      const normalized = parsed.inferredStage.charAt(0).toUpperCase() + parsed.inferredStage.slice(1).toLowerCase();
      const stages: string[] = ['Infrared', 'Magenta', 'Red', 'Amber', 'Orange', 'Green', 'Turquoise', 'White'];
      if (stages.includes(normalized)) {
        inferredStage = normalized as Stage;
      }
    }

    return {
      score,
      feedback: parsed.feedback ?? '',
      inferredStage,
      confidence: parsed.confidence,
    };
  } catch {
    return FALLBACK;
  }
}

export async function queryLLM(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const baseUrl = import.meta.env.VITE_LLM_BASE_URL as string | undefined;
  const apiKey = import.meta.env.VITE_LLM_API_KEY as string | undefined;
  const model = import.meta.env.VITE_LLM_MODEL as string | undefined;

  if (!baseUrl || !apiKey || apiKey === 'sk-placeholder' || !model) {
    return '{"error": "LLM unavailable"}';
  }

  try {
    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
      }),
    });

    if (!res.ok) return '{"error": "fetch error"}';

    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    return data.choices[0]?.message.content ?? '';
  } catch {
    return '{"error": "exception"}';
  }
}
