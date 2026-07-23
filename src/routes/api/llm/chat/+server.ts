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
 * Response modes (audited v1):
 *   - Without `Accept: text/event-stream`: JSON body, full buffered.
 *     VeilFilter applied to the complete finalised output.
 *     Used by the setup probe and any non-streaming caller.
 *   - With `Accept: text/event-stream`: Server-Sent Events stream.
 *     Frames are `data: {"text": "..."}` per delta + a final
 *     `data: [DONE]` frame. VeilFilter runs once at end-of-stream on
 *     the concatenated text; if any violations are detected the final
 *     frame is `data: {"veiled": "...", "violations": [...]}`. Mid-stream
 *     frames are raw provider deltas — they are NOT persisted, only the
 *     final veiled concatenated text is.
 */

import { error } from '@sveltejs/kit';
import { proxyChatCompletion, proxyChatCompletionStream } from '../_lib.js';
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

  // Mode-detect: streaming if the client asked for SSE.
  const accept = request.headers.get('accept') ?? '';
  if (accept.includes('text/event-stream')) {
    return proxyChatCompletionStream(
      body as Parameters<typeof proxyChatCompletionStream>[0]
    );
  }

  // Default — buffered JSON.
  return proxyChatCompletion(
    body as Parameters<typeof proxyChatCompletion>[0]
  );
};
