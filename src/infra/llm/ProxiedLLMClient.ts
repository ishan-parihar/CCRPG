/**
 * ProxiedLLMClient — browser-side LLM client that routes through the BFF.
 *
 * CRITICAL SECURITY: This module is used when running in the browser.
 * It NEVER touches an LLM API key directly. All requests go to
 * /api/llm/* endpoints, which hold the key server-side.
 *
 * The CLI (scripts/cli-game.ts) uses LLMClient.ts directly with
 * process.env-based config — that path is unaffected.
 *
 * VeilFilter runs server-side (in the BFF), so we don't apply it here.
 * This is intentional: the Veil rules can be updated on the server
 * without redeploying the client.
 */

/** Timeout for BFF fetch calls (45 seconds — longer than LLM_TIMEOUT_MS
 * to allow for proxy overhead). */
const BFF_TIMEOUT_MS = 45_000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = BFF_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Check if the BFF is available (i.e. we're running in the browser
 * with the SvelteKit server running). In SSR or CLI contexts, returns
 * false and the caller falls back to direct LLMClient.
 *
 * R11-U1 (Fresh-User UX Audit): Fixed operator-precedence bug. The previous
 * expression `A && B && C || D` evaluated as `(A && B && C) || D` due to
 * `&&` binding tighter than `||`. In the CLI, `D` (NODE_ENV !== 'test')
 * was true, so the function returned true — causing queryLLM to route
 * through the non-existent BFF proxy at /api/llm/chat, which silently
 * failed with "LLM synthesis skipped (LLM unavailable)" on every session.
 * This was the single biggest BLOCKER in the R11 audit.
 */
export function isBrowserWithBFF(): boolean {
  return (
    typeof window !== 'undefined' &&
    typeof fetch === 'function' &&
    // Don't use the BFF in test environments (vitest sets up jsdom but
    // there's no server running). Tests mock LLMClient directly.
    (typeof process === 'undefined' || process.env?.NODE_ENV !== 'test')
  );
}

/**
 * Proxy a chat completion to /api/llm/chat.
 * Returns the raw provider response (OpenAI or Anthropic format).
 */
export async function proxyQueryLLM(
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  try {
    const res = await fetchWithTimeout('/api/llm/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompt,
        messages: [{ role: 'user', content: userMessage }],
        temperature: 0.7,
        maxTokens: 4096,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      return `{"error": "BFF error: ${res.status}", "detail": ${JSON.stringify(errBody)}}`;
    }

    const data = await res.json() as any;
    // Extract text content from either OpenAI or Anthropic response format.
    // The BFF applies VeilFilter server-side, so content is already filtered.
    if (data.content?.[0]?.text !== undefined) {
      // Anthropic format
      return data.content[0].text;
    }
    if (data.choices?.[0]?.message?.content !== undefined) {
      // OpenAI format
      return data.choices[0].message.content;
    }
    return JSON.stringify(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return `{"error": "BFF exception: ${message}"}`;
  }
}

/**
 * Proxy a tool-calling chat completion to /api/llm/tools.
 * Returns content + toolCalls.
 */
export async function proxyQueryLLMWithTools(
  systemPrompt: string,
  messages: readonly { role: string; content: string | null; toolCalls?: readonly unknown[]; toolCallId?: string; name?: string }[],
  tools?: readonly unknown[],
): Promise<{ readonly content: string | null; readonly toolCalls?: readonly unknown[] }> {
  try {
    const res = await fetchWithTimeout('/api/llm/tools', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemPrompt,
        messages,
        tools,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      return { content: `{"error": "BFF error: ${res.status}", "detail": ${JSON.stringify(errBody)}}` };
    }

    const data = await res.json() as any;

    // Anthropic format
    if (data.content) {
      const textBlock = data.content.find((b: any) => b.type === 'text');
      const toolBlocks = data.content.filter((b: any) => b.type === 'tool_use');
      return {
        content: textBlock?.text ?? null,
        toolCalls: toolBlocks.length > 0
          ? toolBlocks.map((b: any) => ({
            id: b.id,
            type: 'function' as const,
            function: { name: b.name, arguments: JSON.stringify(b.input) },
          }))
          : undefined,
      };
    }

    // OpenAI format
    const choice = data.choices?.[0]?.message;
    if (choice) {
      return {
        content: choice.content ?? null,
        toolCalls: choice.tool_calls,
      };
    }

    return { content: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { content: `{"error": "BFF exception: ${message}"}` };
  }
}

/**
 * Proxy an evaluation request (used by evaluateResponse).
 * Returns { score, feedback, inferredStage?, confidence? }.
 */
export async function proxyEvaluateResponse(
  prompt: string,
  rubric: string,
  playerResponse: string,
): Promise<{ readonly score: number; readonly feedback: string; readonly inferredStage?: string; readonly confidence?: number }> {
  const systemContent = `You are a developmental psychology scoring rubric evaluator. ${rubric}\nIf evaluating a calibration probe, determine which developmental stage (Infrared, Magenta, Red, Amber, Orange, Green, Turquoise, White) the player response corresponds to and provide a confidence rating. Respond ONLY with JSON: {"score": <0-1>, "feedback": "<brief>", "inferredStage": "<stage>", "confidence": <0-1>}`;
  const userContent = `Prompt: ${prompt}\nPlayer response: ${playerResponse}`;

  try {
    const res = await fetchWithTimeout('/api/llm/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system: systemContent,
        messages: [{ role: 'user', content: userContent }],
        temperature: 0.2,
        maxTokens: 1024,
      }),
    });

    if (!res.ok) {
      return { score: 0.5, feedback: 'LLM unavailable' };
    }

    const data = await res.json() as any;
    let content = '';
    if (data.content?.[0]?.text !== undefined) {
      content = data.content[0].text;
    } else if (data.choices?.[0]?.message?.content !== undefined) {
      content = data.choices[0].message.content;
    }

    const parsed = JSON.parse(content) as { score: number; feedback: string; inferredStage?: string; confidence?: number };
    const score = Math.max(0, Math.min(1, parsed.score));
    return {
      score,
      feedback: parsed.feedback ?? '',
      inferredStage: parsed.inferredStage,
      confidence: parsed.confidence,
    };
  } catch {
    return { score: 0.5, feedback: 'LLM unavailable' };
  }
}
