/**
 * LLMClient — thin wrapper around a chat-completions endpoint.
 * Used for open-ended response evaluation in later-stage probes.
 */

interface LLMEvaluation {
  readonly score: number;
  readonly feedback: string;
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
          { role: 'system', content: `You are a scoring rubric evaluator. ${rubric}\nRespond ONLY with JSON: {"score": <0-1>, "feedback": "<brief>"}` },
          { role: 'user', content: `Prompt: ${prompt}\nPlayer response: ${playerResponse}` },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) return FALLBACK;

    const data = (await res.json()) as { choices: { message: { content: string } }[] };
    const content = data.choices[0]?.message.content ?? '';
    const parsed = JSON.parse(content) as { score: number; feedback: string };
    const score = Math.max(0, Math.min(1, parsed.score));
    return { score, feedback: parsed.feedback ?? '' };
  } catch {
    return FALLBACK;
  }
}
