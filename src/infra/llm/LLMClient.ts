/**
 * LLMClient — thin wrapper around a chat-completions endpoint.
 * Used for open-ended response evaluation in later-stage probes.
 *
 * T-3.6: Veil violations detected by filterOutput are logged to console.warn
 * for telemetry aggregation. In production, these should be routed to the
 * TelemetryService for centralized monitoring.
 *
 * Dynamic-config refactor (UX-R3 follow-up): the previous implementation
 * hard-read VITE_LLM_* env vars. The new implementation resolves config
 * through ProviderRegistry.resolveConfig(), which supports:
 *   - Provider-specific env vars (OPENCODE_API_KEY, ANTHROPIC_API_KEY, etc.)
 *   - Generic LLM_* env vars (LLM_PROVIDER, LLM_BASE_URL, LLM_API_KEY, LLM_MODEL)
 *   - Legacy VITE_LLM_* env vars (backwards compat)
 *   - The MODEL env var (per the user's spec)
 *   - Saved config file (~/.ccrpg/config.json)
 * No hardcoded model names anywhere — models come from /models or models.dev.
 */

import type { Stage } from '../../core/domain/Stage.js';
import type { AgentMessage, ToolCall } from '../../core/assessments/agentTypes.js';
import { filterInput, filterOutput } from './VeilFilter.js';
import { resolveConfig, isComplete, type LLMConfig } from './ProviderRegistry.js';

/** T-3.6: Log Veil violations for telemetry. */
function logVeilViolation(source: string, violations: readonly string[]): void {
  if (violations.length === 0) return;
  // In production, route to TelemetryService. For now, console.warn.
  console.warn(`[VeilFilter] ${source}: ${violations.length} violation(s): ${violations.join(', ')}`);
}

export interface LLMEvaluation {
  readonly score: number;
  readonly feedback: string;
  readonly inferredStage?: Stage;
  readonly confidence?: number;
}

const FALLBACK: LLMEvaluation = { score: 0.5, feedback: 'LLM unavailable' };

/** Timeout for LLM fetch calls (30 seconds) */
const LLM_TIMEOUT_MS = 30_000;

/** Fetch with AbortController timeout to prevent hangs */
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = LLM_TIMEOUT_MS): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Resolve the active LLM config. Reads from env vars + saved config file
 * via ProviderRegistry. The CLI calls this once at startup and seeds
 * process.env.VITE_LLM_* for backwards compat with code that still reads
 * those directly. New code should call this function instead.
 *
 * The savedConfig parameter is optional — when omitted, only env vars are
 * consulted. The CLI passes the loaded ~/.ccrpg/config.json here.
 */
let cachedConfig: LLMConfig | null = null;
export function getActiveConfig(savedConfig?: Parameters<typeof resolveConfig>[1]): LLMConfig {
  if (cachedConfig && !savedConfig) return cachedConfig;
  cachedConfig = resolveConfig({}, savedConfig ?? {});
  return cachedConfig;
}

/**
 * Returns the active config only if the LLM is enabled AND the config is
 * complete. Returns null otherwise. This is the function LLM call sites
 * should use — it respects both --no-llm (via setLLMDisabled) and missing
 * config (via isComplete). Replaces the old `isComplete(getActiveConfig())`
 * pattern which didn't account for --no-llm.
 */
export function getEnabledConfig(savedConfig?: Parameters<typeof resolveConfig>[1]): LLMConfig | null {
  if (llmGloballyDisabled) return null;
  const config = getActiveConfig(savedConfig);
  return isComplete(config) ? config : null;
}

/** Invalidate the cached config (used when setup saves a new config). */
export function invalidateConfigCache(): void {
  cachedConfig = null;
}

/**
 * Global LLM disable flag. Set by the CLI when --no-llm is passed.
 * When true, all LLM calls short-circuit to the fallback path, even if
 * the config is complete (i.e. an API key is present). This ensures
 * --no-llm truly disables the LLM everywhere — not just in the CLI's
 * LLM_ACTIVE flag. Previously the PersistentAgent path would still call
 * the LLM because isComplete() returned true (the config file had a key).
 */
let llmGloballyDisabled = false;
export function setLLMDisabled(disabled: boolean): void {
  llmGloballyDisabled = disabled;
}
export function isLLMDisabled(): boolean {
  return llmGloballyDisabled;
}

function isAnthropicProtocol(config: LLMConfig): boolean {
  return config.protocol === 'anthropic' || config.baseUrl.includes('anthropic.com');
}

function buildHeaders(config: LLMConfig): Record<string, string> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey && config.apiKey !== 'sk-placeholder') {
    if (config.authStyle === 'x-api-key') {
      headers['x-api-key'] = config.apiKey;
      if (config.protocol === 'anthropic') headers['anthropic-version'] = '2023-06-01';
    } else {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }
  }
  return headers;
}

export async function evaluateResponse(
  prompt: string,
  rubric: string,
  playerResponse: string,
): Promise<LLMEvaluation> {
  const config = getEnabledConfig();
  if (!config) return FALLBACK;

  const systemContent = `You are a developmental psychology scoring rubric evaluator. ${rubric}\nIf evaluating a calibration probe, determine which developmental stage (Infrared, Magenta, Red, Amber, Orange, Green, Turquoise, White) the player response corresponds to and provide a confidence rating. Respond ONLY with JSON: {"score": <0-1>, "feedback": "<brief>", "inferredStage": "<stage>", "confidence": <0-1>}`;
  const userContent = `Prompt: ${prompt}\nPlayer response: ${playerResponse}`;

  try {
    let res: Response;
    if (isAnthropicProtocol(config)) {
      res = await fetchWithTimeout(`${config.baseUrl}/messages`, {
        method: 'POST',
        headers: buildHeaders(config),
        body: JSON.stringify({
          model: config.model,
          system: systemContent,
          messages: [{ role: 'user', content: userContent }],
          temperature: 0.2,
          max_tokens: 1024,
        }),
      });
    } else {
      res = await fetchWithTimeout(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: buildHeaders(config),
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: systemContent },
            { role: 'user', content: userContent },
          ],
          temperature: 0.2,
        }),
      });
    }

    if (!res.ok) return FALLBACK;

    const data = (await res.json()) as any;
    const content = isAnthropicProtocol(config)
      ? data.content?.[0]?.text ?? ''
      : data.choices?.[0]?.message?.content ?? '';
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
      feedback: (() => { const r = filterOutput(parsed.feedback ?? ''); logVeilViolation('evaluateResponse.feedback', r.violations); return r.filtered; })(),
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
  const config = getEnabledConfig();
  if (!config) return '{"error": "LLM unavailable"}';

  // DEV-5: Apply VeilFilter.filterInput to the system prompt + user message
  // before sending to the LLM. The Veil is bidirectional per foundations/20 —
  // filtering only output is half a Veil. Input filtering prevents the LLM
  // from seeing system-terms (stage labels, drive names, etc.) that would
  // bias its generation toward technical language.
  const veiledSystemPrompt = filterInput(systemPrompt);
  const veiledUserMessage = filterInput(userMessage);

  try {
    let res: Response;
    if (isAnthropicProtocol(config)) {
      res = await fetchWithTimeout(`${config.baseUrl}/messages`, {
        method: 'POST',
        headers: buildHeaders(config),
        body: JSON.stringify({
          model: config.model,
          system: veiledSystemPrompt,
          messages: [{ role: 'user', content: veiledUserMessage }],
          temperature: 0.7,
          max_tokens: 4096,
        }),
      });
    } else {
      res = await fetchWithTimeout(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: buildHeaders(config),
        body: JSON.stringify({
          model: config.model,
          messages: [
            { role: 'system', content: veiledSystemPrompt },
            { role: 'user', content: veiledUserMessage },
          ],
          temperature: 0.7,
        }),
      });
    }

    if (!res.ok) return `{"error": "fetch error: ${res.status}"}`;

    const data = (await res.json()) as any;
    const rawContent = isAnthropicProtocol(config)
      ? data.content?.[0]?.text ?? ''
      : data.choices?.[0]?.message?.content ?? '';
    { const r = filterOutput(rawContent); logVeilViolation('queryLLM', r.violations); return r.filtered; }
  } catch (err: any) {
    return `{"error": "exception: ${err.message || err}"}`;
  }
}

export interface LLMToolResponse {
  readonly content: string | null;
  readonly toolCalls?: readonly ToolCall[];
}

export async function queryLLMWithTools(
  systemPrompt: string,
  messages: readonly AgentMessage[],
  tools?: readonly any[],
): Promise<LLMToolResponse> {
  const config = getEnabledConfig();
  if (!config) return { content: '{"error": "LLM unavailable"}' };

  // DEV-5: Apply VeilFilter.filterInput to the system prompt before sending.
  const veiledSystemPrompt = filterInput(systemPrompt);

  const anthropic = isAnthropicProtocol(config);

  const mappedMessages = messages.map(msg => {
    const result: any = { role: msg.role, content: msg.content };
    if (msg.toolCalls) {
      result.tool_calls = msg.toolCalls.map(tc => ({
        id: tc.id, type: tc.type,
        function: { name: tc.function.name, arguments: tc.function.arguments },
      }));
    }
    if (msg.toolCallId) result.tool_call_id = msg.toolCallId;
    if (msg.name) result.name = msg.name;
    return result;
  });

  try {
    let res: Response;
    if (anthropic) {
      // Anthropic: system goes to top-level param, no system role in messages
      const systemMsg = mappedMessages.find(m => m.role === 'system');
      const nonSystemMsgs = mappedMessages.filter(m => m.role !== 'system');
      const body: any = {
        model: config.model,
        system: systemMsg?.content ?? veiledSystemPrompt,
        messages: nonSystemMsgs,
        temperature: 0.7,
        max_tokens: 4096,
      };
      if (tools && tools.length > 0) {
        body.tools = tools.map((t: any) => ({
          name: t.function?.name ?? t.name,
          description: t.function?.description ?? t.description ?? '',
          input_schema: t.function?.parameters ?? t.parameters ?? { type: 'object', properties: {} },
        }));
      }
      res = await fetchWithTimeout(`${config.baseUrl}/messages`, {
        method: 'POST',
        headers: buildHeaders(config),
        body: JSON.stringify(body),
      });
    } else {
      const body: any = {
        model: config.model,
        messages: [{ role: 'system', content: veiledSystemPrompt }, ...mappedMessages],
        temperature: 0.7,
      };
      if (tools && tools.length > 0) body.tools = tools;
      res = await fetchWithTimeout(`${config.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: buildHeaders(config),
        body: JSON.stringify(body),
      });
    }

    if (!res.ok) {
      return { content: `{"error": "fetch error: ${res.status}"}` };
    }

    const data = (await res.json()) as any;

    if (anthropic) {
      // Anthropic response: content is an array of blocks
      const textBlock = data.content?.find((b: any) => b.type === 'text');
      const toolBlocks = data.content?.filter((b: any) => b.type === 'tool_use') ?? [];
      const textContent = textBlock?.text != null
        ? (() => { const r = filterOutput(textBlock.text); logVeilViolation('queryLLMWithTools.anthropic', r.violations); return r.filtered; })()
        : null;
      return {
        content: textContent,
        toolCalls: toolBlocks.length > 0 ? toolBlocks.map((b: any) => ({
          id: b.id,
          type: 'function' as const,
          function: { name: b.name, arguments: JSON.stringify(b.input) },
        })) : undefined,
      };
    }

    const choice = data.choices?.[0]?.message;
    if (!choice) return { content: null };
    const choiceContent = choice.content != null
      ? (() => { const r = filterOutput(choice.content); logVeilViolation('queryLLMWithTools.openai', r.violations); return r.filtered; })()
      : null;
    return {
      content: choiceContent,
      toolCalls: choice.tool_calls?.map((tc: any) => ({
        id: tc.id, type: tc.type,
        function: { name: tc.function.name, arguments: tc.function.arguments },
      })),
    };
  } catch (err: any) {
    return { content: `{"error": "exception: ${err.message || err}"}` };
  }
}

