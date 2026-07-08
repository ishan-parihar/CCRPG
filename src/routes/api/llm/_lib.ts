/**
 * Server-side LLM proxy helper.
 *
 * Used by the LLM API route handlers (chat, tools).
 *
 * CRITICAL SECURITY: This file reads LLM_API_KEY from server-only env.
 * The key NEVER reaches the client bundle. The client calls the LLM
 * API endpoints and this helper forwards to the actual provider.
 *
 * VeilFilter runs server-side (input AND output) so its rules can be
 * updated without redeploying the client.
 */

import { filterInput, filterOutput } from '$shared/llm/VeilFilter.js';
import { env } from '$env/dynamic/private';

/** Timeout for LLM fetch calls (30 seconds). */
const LLM_TIMEOUT_MS = 30_000;

export interface LLMProviderConfig {
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly model: string;
  readonly protocol: 'openai' | 'anthropic';
  readonly authStyle?: 'bearer' | 'x-api-key';
  readonly providerName: string;
}

/**
 * Resolve the active LLM config from server-side env vars.
 * Returns null if the LLM is not configured (dev without key, or
 * production with LLM disabled).
 */
export function resolveServerLLMConfig(): LLMProviderConfig | null {
  // Priority: LLM_PROVIDER/LLM_BASE_URL/LLM_API_KEY/LLM_MODEL
  // → OPENAI_API_KEY / ANTHROPIC_API_KEY
  const apiKey =
    env.LLM_API_KEY ||
    env.OPENAI_API_KEY ||
    env.ANTHROPIC_API_KEY ||
    '';
  if (!apiKey || apiKey === 'sk-placeholder') return null;

  const provider = (env.LLM_PROVIDER || '').toLowerCase();
  const baseUrl =
    env.LLM_BASE_URL ||
    (provider === 'anthropic' || env.ANTHROPIC_API_KEY
      ? 'https://api.anthropic.com/v1'
      : 'https://api.openai.com/v1');
  const model =
    env.LLM_MODEL ||
    (provider === 'anthropic' || env.ANTHROPIC_API_KEY
      ? 'claude-3-5-sonnet-20241022'
      : 'gpt-4o-mini');
  const protocol: 'openai' | 'anthropic' =
    provider === 'anthropic' || baseUrl.includes('anthropic.com')
      ? 'anthropic'
      : 'openai';
  const authStyle: 'bearer' | 'x-api-key' =
    protocol === 'anthropic' ? 'x-api-key' : 'bearer';

  return {
    baseUrl,
    apiKey,
    model,
    protocol,
    authStyle,
    providerName: provider || (protocol === 'anthropic' ? 'anthropic' : 'openai'),
  };
}

/** Fetch with AbortController timeout to prevent hangs. */
async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs = LLM_TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

function buildHeaders(config: LLMProviderConfig): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.authStyle === 'x-api-key') {
    headers['x-api-key'] = config.apiKey;
    if (config.protocol === 'anthropic') headers['anthropic-version'] = '2023-06-01';
  } else {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }
  return headers;
}

/** Log Veil violations for telemetry (server-side only). */
function logVeilViolation(source: string, violations: readonly string[]): void {
  if (violations.length === 0) return;
  console.warn(`[VeilFilter:server] ${source}: ${violations.length} violation(s): ${violations.join(', ')}`);
}

/**
 * Proxy a chat completion request to the configured LLM provider.
 * Applies VeilFilter to input (system + user messages) and output.
 *
 * Returns the provider's response (OpenAI or Anthropic format),
 * with Veil-filtered content.
 */
export async function proxyChatCompletion(
  body: {
    readonly messages: readonly { role: string; content: string }[];
    readonly system?: string;
    readonly temperature?: number;
    readonly maxTokens?: number;
    readonly tools?: readonly unknown[];
  },
): Promise<Response> {
  const config = resolveServerLLMConfig();
  if (!config) {
    return new Response(
      JSON.stringify({ error: 'LLM not configured server-side' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } },
    );
  }

  // Apply VeilFilter to input.
  const veiledSystem = body.system ? filterInput(body.system) : undefined;
  const veiledMessages = body.messages.map((m) => ({
    ...m,
    content: filterInput(m.content),
  }));

  try {
    let res: Response;
    if (config.protocol === 'anthropic') {
      const anthropicBody: Record<string, unknown> = {
        model: config.model,
        system: veiledSystem ?? '',
        messages: veiledMessages.filter((m) => m.role !== 'system'),
        temperature: body.temperature ?? 0.7,
        max_tokens: body.maxTokens ?? 4096,
      };
      if (body.tools && body.tools.length > 0) {
        anthropicBody.tools = body.tools.map((t: any) => ({
          name: t.function?.name ?? t.name,
          description: t.function?.description ?? t.description ?? '',
          input_schema: t.function?.parameters ?? t.parameters ?? { type: 'object', properties: {} },
        }));
      }
      res = await fetchWithTimeout(`${config.baseUrl}/messages`, {
        method: 'POST',
        headers: buildHeaders(config),
        body: JSON.stringify(anthropicBody),
      });
    } else {
      const openaiBody: Record<string, unknown> = {
        model: config.model,
        messages: veiledSystem
          ? [{ role: 'system', content: veiledSystem }, ...veiledMessages]
          : veiledMessages,
        temperature: body.temperature ?? 0.7,
      };
      if (body.maxTokens) openaiBody.max_tokens = body.maxTokens;
      if (body.tools && body.tools.length > 0) openaiBody.tools = body.tools;
      res = await fetchWithTimeout(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: buildHeaders(config),
        body: JSON.stringify(openaiBody),
      });
    }

    if (!res.ok) {
      const errText = await res.text();
      return new Response(
        JSON.stringify({ error: `LLM provider error: ${res.status}`, detail: errText }),
        { status: res.status, headers: { 'Content-Type': 'application/json' } },
      );
    }

    const data = await res.json() as any;

    // Apply VeilFilter to output content.
    if (config.protocol === 'anthropic') {
      const textBlock = data.content?.find((b: any) => b.type === 'text');
      if (textBlock?.text) {
        const r = filterOutput(textBlock.text);
        logVeilViolation('proxyChatCompletion.anthropic', r.violations);
        textBlock.text = r.filtered;
      }
      if (data.content) {
        const toolBlocks = data.content.filter((b: any) => b.type === 'tool_use');
        if (toolBlocks.length > 0) {
          return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' },
          });
        }
      }
    } else {
      const choice = data.choices?.[0]?.message;
      if (choice?.content) {
        const r = filterOutput(choice.content);
        logVeilViolation('proxyChatCompletion.openai', r.violations);
        choice.content = r.filtered;
      }
    }

    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: `LLM proxy exception: ${message}` }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    );
  }
}
