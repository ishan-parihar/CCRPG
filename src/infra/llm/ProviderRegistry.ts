/**
 * ProviderRegistry — dynamic multi-provider LLM configuration.
 *
 * Modeled on opencode's architecture (https://github.com/anomalyco/opencode):
 *   - packages/llm/src/providers/openai-compatible.ts — generic OpenAI-compatible
 *   - packages/llm/src/providers/openai-compatible-profile.ts — known provider profiles
 *   - https://models.dev — community-maintained provider+model catalog
 *
 * Design principles (learned from opencode):
 *   1. NO hardcoded model lists. Models are fetched dynamically from each
 *      provider's /models endpoint, with models.dev as a fallback catalog.
 *   2. Provider "profiles" carry only the immutable bits: provider id,
 *      display name, base URL, auth header style, env var name for the key.
 *      The model list is always runtime-fetched.
 *   3. Env vars are the primary config surface; the config file is a cache.
 *      This matches opencode's `env: ["OPENCODE_API_KEY"]` convention.
 *   4. The "custom" provider profile accepts any baseURL — for providers
 *      not in the known catalog (e.g. a self-hosted vLLM, a new gateway).
 *
 * The previous implementation hardcoded model lists inline (gpt-4o,
 * claude-3-haiku-20240307, gemini-1.5-flash, the fake gemma-4-31b-it).
 * Those lists go stale the moment a provider ships a new model. This
 * module replaces them with runtime discovery.
 */

/**
 * Auth header style — mirrors opencode's AuthOptions.bearer() vs custom.
 * OpenAI-compatible providers use `Authorization: Bearer <key>`.
 * Anthropic uses `x-api-key: <key>` + `anthropic-version: <date>`.
 */
export type AuthStyle = 'bearer' | 'x-api-key';

/**
 * API protocol family — mirrors opencode's openai vs anthropic routes.
 */
export type ApiProtocol = 'openai' | 'anthropic';

/**
 * A provider profile — immutable catalog entry for a known provider.
 * Mirrors opencode's OpenAICompatibleProfile + ProviderInfo.
 */
export interface ProviderProfile {
  readonly id: string;
  readonly name: string;
  readonly baseUrl: string;
  readonly authStyle: AuthStyle;
  readonly protocol: ApiProtocol;
  /** Env var name(s) that hold the API key for this provider. First match wins. */
  readonly envVars: readonly string[];
  /** Optional doc URL shown in setup. */
  readonly docUrl?: string;
}

/**
 * A model discovered at runtime from a provider's /models endpoint,
 * or from the models.dev fallback catalog.
 */
export interface DiscoveredModel {
  readonly id: string;
  /** Human-readable label; falls back to id if unknown. */
  readonly label: string;
  /** Optional hint (e.g. "Free", "Reasoning") for the setup UI. */
  readonly hint?: string;
  /** Whether the model supports tool calling (function calling). */
  readonly toolCall?: boolean;
}

/**
 * Resolved LLM configuration — the final shape consumed by LLMClient.
 * All fields are guaranteed non-empty when LLMConfig.isComplete(config) is true.
 */
export interface LLMConfig {
  readonly providerId: string;
  readonly providerName: string;
  readonly baseUrl: string;
  readonly apiKey: string;
  readonly model: string;
  readonly authStyle: AuthStyle;
  readonly protocol: ApiProtocol;
}

// ── Known provider profiles ──────────────────────────────────────────
// Source: opencode/packages/llm/src/providers/openai-compatible-profile.ts
// + models.dev/api.json (https://models.dev).
// These carry ONLY the immutable bits (baseUrl, auth, env var name).
// The model list is always fetched dynamically — never hardcoded here.

const PROFILES: Readonly<Record<string, ProviderProfile>> = {
  opencode: {
    id: 'opencode',
    name: 'OpenCode Zen',
    baseUrl: 'https://opencode.ai/zen/v1',
    authStyle: 'bearer',
    protocol: 'openai',
    envVars: ['OPENCODE_API_KEY', 'OPENCODE_API'],
    docUrl: 'https://opencode.ai/docs/zen',
  },
  openai: {
    id: 'openai',
    name: 'OpenAI',
    baseUrl: 'https://api.openai.com/v1',
    authStyle: 'bearer',
    protocol: 'openai',
    envVars: ['OPENAI_API_KEY'],
    docUrl: 'https://platform.openai.com/docs/models',
  },
  anthropic: {
    id: 'anthropic',
    name: 'Anthropic',
    baseUrl: 'https://api.anthropic.com/v1',
    authStyle: 'x-api-key',
    protocol: 'anthropic',
    envVars: ['ANTHROPIC_API_KEY'],
    docUrl: 'https://docs.anthropic.com/en/docs/models',
  },
  gemini: {
    id: 'gemini',
    name: 'Google Gemini (OpenAI-compat)',
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    authStyle: 'bearer',
    protocol: 'openai',
    envVars: ['GEMINI_API_KEY', 'GOOGLE_API_KEY'],
    docUrl: 'https://ai.google.dev/gemini-api/docs/models',
  },
  openrouter: {
    id: 'openrouter',
    name: 'OpenRouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    authStyle: 'bearer',
    protocol: 'openai',
    envVars: ['OPENROUTER_API_KEY'],
    docUrl: 'https://openrouter.ai/docs',
  },
  groq: {
    id: 'groq',
    name: 'Groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    authStyle: 'bearer',
    protocol: 'openai',
    envVars: ['GROQ_API_KEY'],
    docUrl: 'https://console.groq.com/docs',
  },
  deepseek: {
    id: 'deepseek',
    name: 'DeepSeek',
    baseUrl: 'https://api.deepseek.com/v1',
    authStyle: 'bearer',
    protocol: 'openai',
    envVars: ['DEEPSEEK_API_KEY'],
    docUrl: 'https://api-docs.deepseek.com/',
  },
  cerebras: {
    id: 'cerebras',
    name: 'Cerebras',
    baseUrl: 'https://api.cerebras.ai/v1',
    authStyle: 'bearer',
    protocol: 'openai',
    envVars: ['CEREBRAS_API_KEY'],
    docUrl: 'https://docs.cerebras.ai/',
  },
  fireworks: {
    id: 'fireworks',
    name: 'Fireworks AI',
    baseUrl: 'https://api.fireworks.ai/inference/v1',
    authStyle: 'bearer',
    protocol: 'openai',
    envVars: ['FIREWORKS_API_KEY'],
    docUrl: 'https://docs.fireworks.ai/',
  },
  togetherai: {
    id: 'togetherai',
    name: 'Together AI',
    baseUrl: 'https://api.together.xyz/v1',
    authStyle: 'bearer',
    protocol: 'openai',
    envVars: ['TOGETHER_API_KEY'],
    docUrl: 'https://docs.together.ai/',
  },
  xai: {
    id: 'xai',
    name: 'xAI (Grok)',
    baseUrl: 'https://api.x.ai/v1',
    authStyle: 'bearer',
    protocol: 'openai',
    envVars: ['XAI_API_KEY'],
    docUrl: 'https://docs.x.ai/',
  },
  ollama: {
    id: 'ollama',
    name: 'Ollama (Local)',
    baseUrl: 'http://localhost:11434/v1',
    authStyle: 'bearer',
    protocol: 'openai',
    envVars: [], // Ollama doesn't require a key
    docUrl: 'https://ollama.com/library',
  },
  custom: {
    id: 'custom',
    name: 'Custom Provider',
    baseUrl: '', // supplied at runtime
    authStyle: 'bearer',
    protocol: 'openai',
    envVars: ['LLM_API_KEY'],
    docUrl: undefined,
  },
};

export const KNOWN_PROVIDER_IDS = Object.keys(PROFILES);

export function getProfile(providerId: string): ProviderProfile | undefined {
  return PROFILES[providerId];
}

export function listProfiles(): readonly ProviderProfile[] {
  return Object.values(PROFILES);
}

// ── Config resolution ────────────────────────────────────────────────

function env(name: string): string | undefined {
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }
  return undefined;
}

/**
 * Resolve the LLM config from env vars + config file + provider profile.
 *
 * Priority (highest first):
 *   1. Explicit --provider / --base-url / --model / --api-key CLI flags
 *      (passed in via the overrides param — the CLI reads them from commander)
 *   2. Provider-specific env vars (e.g. OPENCODE_API_KEY for opencode)
 *   3. Generic LLM_* env vars (LLM_PROVIDER, LLM_BASE_URL, LLM_API_KEY, LLM_MODEL)
 *   4. Legacy VITE_LLM_* env vars (backwards compat with existing config)
 *   5. The saved config file (~/.ccrpg/config.json)
 *
 * Env var name resolution:
 *   - For a known provider (e.g. 'opencode'), the API key is read from
 *     the provider's envVars list (e.g. OPENCODE_API_KEY, then OPENCODE_API).
 *   - For 'custom', reads LLM_API_KEY.
 *   - For any provider, LLM_API_KEY is a generic fallback.
 *
 * baseUrl resolution:
 *   - For a known provider, the profile's baseUrl is the default.
 *   - LLM_BASE_URL or VITE_LLM_BASE_URL overrides it.
 *   - For 'custom', LLM_BASE_URL is required.
 *
 * model resolution:
 *   - LLM_MODEL or VITE_LLM_MODEL or provider-specific default (none for
 *     most providers now — the user must specify or pick from /models).
 */
export interface ConfigOverrides {
  readonly providerId?: string;
  readonly baseUrl?: string;
  readonly apiKey?: string;
  readonly model?: string;
}

export interface SavedConfig {
  readonly llm?: {
    readonly provider?: string;
    readonly baseUrl?: string;
    readonly apiKey?: string;
    readonly model?: string;
  };
}

export function resolveConfig(
  overrides: ConfigOverrides,
  saved: SavedConfig,
): LLMConfig {
  // 1. Provider ID
  const providerId =
    overrides.providerId
    || env('LLM_PROVIDER')
    || env('VITE_LLM_PROVIDER')
    || saved.llm?.provider
    || 'opencode'; // sensible default — opencode.ai/zen is the project's primary gateway

  const profile = getProfile(providerId) ?? PROFILES.custom!;

  // 2. Base URL
  const baseUrl =
    overrides.baseUrl
    || env('LLM_BASE_URL')
    || env('VITE_LLM_BASE_URL')
    || saved.llm?.baseUrl
    || profile.baseUrl
    || '';

  // 3. API key — try provider-specific env vars first, then generic, then saved
  const apiKey =
    overrides.apiKey
    || (profile.envVars.length > 0
        ? profile.envVars.map(v => env(v)).find(v => !!v && v !== 'sk-placeholder')
        : undefined)
    || env('LLM_API_KEY')
    || env('VITE_LLM_API_KEY')
    || env('OPENAI_API_KEY') // very common fallback
    || saved.llm?.apiKey
    || '';

  // 4. Model
  const model =
    overrides.model
    || env('LLM_MODEL')
    || env('VITE_LLM_MODEL')
    || env('MODEL') // the user's spec listed `MODEL=mimo-v2.5-free`
    || saved.llm?.model
    || '';

  return {
    providerId: profile.id,
    providerName: profile.name,
    baseUrl,
    apiKey,
    model,
    authStyle: profile.authStyle,
    protocol: profile.protocol,
  };
}

export function isComplete(config: LLMConfig): boolean {
  // Ollama is the only provider that doesn't require an API key.
  if (config.providerId === 'ollama') {
    return !!config.baseUrl && !!config.model;
  }
  return !!config.baseUrl && !!config.apiKey && config.apiKey !== 'sk-placeholder' && !!config.model;
}

// ── Dynamic model discovery ──────────────────────────────────────────

/** Cache for /models responses, keyed by `${providerId}:${baseUrl}`. */
interface CacheEntry {
  readonly models: readonly DiscoveredModel[];
  readonly fetchedAt: number;
  readonly source: 'provider' | 'models.dev' | 'empty';
}
const modelCache = new Map<string, CacheEntry>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

/** Fetch with timeout to prevent hangs. */
async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs = 10_000): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Fetch the model list from the provider's /models endpoint.
 * OpenAI-compatible providers expose GET /v1/models.
 * Returns an empty array on any failure (caller should fall back to models.dev).
 */
export async function fetchModelsFromProvider(config: LLMConfig): Promise<readonly DiscoveredModel[]> {
  if (!config.baseUrl) return [];
  const url = `${config.baseUrl.replace(/\/$/, '')}/models`;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (config.apiKey && config.apiKey !== 'sk-placeholder') {
    if (config.authStyle === 'x-api-key') {
      headers['x-api-key'] = config.apiKey;
      if (config.protocol === 'anthropic') headers['anthropic-version'] = '2023-06-01';
    } else {
      headers.Authorization = `Bearer ${config.apiKey}`;
    }
  }
  try {
    const res = await fetchWithTimeout(url, { method: 'GET', headers });
    if (!res.ok) return [];
    const data = (await res.json()) as any;
    const list: any[] = data.data ?? data.models ?? (Array.isArray(data) ? data : []);
    return list.map((m: any): DiscoveredModel => {
      const id = typeof m === 'string' ? m : (m.id ?? m.name ?? '');
      return {
        id,
        label: id,
        hint: m.owned_by ? `by ${m.owned_by}` : undefined,
      };
    }).filter(m => !!m.id);
  } catch {
    return [];
  }
}

/**
 * Fetch the model list from the models.dev catalog (community-maintained).
 * Used as a fallback when the provider's /models endpoint is unavailable
 * or returns an empty list. Mirrors opencode's OPENCODE_MODELS_URL convention.
 */
export async function fetchModelsFromCatalog(providerId: string): Promise<readonly DiscoveredModel[]> {
  const url = env('CCRPG_MODELS_URL') || 'https://models.dev/api.json';
  try {
    const res = await fetchWithTimeout(url, { method: 'GET' });
    if (!res.ok) return [];
    const data = (await res.json()) as Record<string, any>;
    const provider = data[providerId];
    if (!provider || !provider.models) return [];
    return Object.entries(provider.models as Record<string, any>).map(([id, m]): DiscoveredModel => ({
      id,
      label: m.name ?? id,
      hint: [
        m.tool_call ? 'tool-use' : null,
        m.reasoning ? 'reasoning' : null,
        m.attachment ? 'multimodal' : null,
        m.cost?.input === 0 && m.cost?.output === 0 ? 'free' : null,
      ].filter(Boolean).join(' · ') || undefined,
      toolCall: m.tool_call,
    }));
  } catch {
    return [];
  }
}

/**
 * Get the model list for a given config. Tries the provider's /models
 * endpoint first, falls back to the models.dev catalog. Caches for 5 min.
 */
export async function getModels(config: LLMConfig): Promise<readonly DiscoveredModel[]> {
  const cacheKey = `${config.providerId}:${config.baseUrl}`;
  const cached = modelCache.get(cacheKey);
  if (cached && (Date.now() - cached.fetchedAt) < CACHE_TTL_MS) {
    return cached.models;
  }

  // Try the provider first.
  let models = await fetchModelsFromProvider(config);
  let source: CacheEntry['source'] = 'provider';

  // Fallback to the catalog.
  if (models.length === 0 && config.providerId !== 'custom') {
    models = await fetchModelsFromCatalog(config.providerId);
    source = models.length > 0 ? 'models.dev' : 'empty';
  } else if (models.length === 0) {
    source = 'empty';
  }

  modelCache.set(cacheKey, { models, fetchedAt: Date.now(), source });
  return models;
}

/** Clear the model cache (used by `ccrpg setup --refresh`). */
export function clearModelCache(): void {
  modelCache.clear();
}

/** Get the source of the last cached fetch (for diagnostics). */
export function getModelCacheSource(config: LLMConfig): 'provider' | 'models.dev' | 'empty' | 'miss' {
  const cacheKey = `${config.providerId}:${config.baseUrl}`;
  return modelCache.get(cacheKey)?.source ?? 'miss';
}
