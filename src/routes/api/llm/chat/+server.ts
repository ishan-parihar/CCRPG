/**
 * POST /api/llm/chat — proxy chat completion to LLM provider.
 *
 * CRITICAL: This is the security fix for the LLM-API-key-exposure hole.
 * The client calls this endpoint; the server holds the API key and
 * forwards to OpenAI/Anthropic. The key NEVER reaches the client bundle.
 *
 * VeilFilter runs server-side on both input and output.
 *
 * Request body (JSON):
 *   {
 *     "messages": [{ "role": "user", "content": "..." }, ...],
 *     "system": "optional system prompt",
 *     "temperature": 0.7,
 *     "maxTokens": 4096,
 *     "tools": [...]  // optional, for tool-calling
 *   }
 *
 * Response: the LLM provider's response (OpenAI or Anthropic format),
 * with Veil-filtered content.
 */

import { error } from '@sveltejs/kit';
import { proxyChatCompletion } from '../_lib.js';
import type { RequestHandler } from './$types';

interface ChatRequestBody {
  readonly messages: readonly { role: string; content: string }[];
  readonly system?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly tools?: readonly unknown[];
}

export const POST: RequestHandler = async ({ request }) => {
  let body: ChatRequestBody;

  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    throw error(400, 'Missing required field: messages (must be non-empty array)');
  }

  for (const msg of body.messages) {
    if (typeof msg.role !== 'string' || typeof msg.content !== 'string') {
      throw error(400, 'Each message must have { role: string, content: string }');
    }
  }

  // After validation, messages is guaranteed non-empty. Cast to satisfy
  // proxyChatCompletion's required-field type.
  return proxyChatCompletion(body as { messages: readonly { role: string; content: string }[]; system?: string; temperature?: number; maxTokens?: number; tools?: readonly unknown[] });
};
