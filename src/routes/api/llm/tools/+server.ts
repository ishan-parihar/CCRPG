/**
 * POST /api/llm/tools — proxy tool-calling chat completion to LLM provider.
 *
 * Same as /api/llm/chat but explicitly for tool-calling requests.
 * Kept as a separate endpoint for clarity and per-endpoint rate-limiting.
 *
 * Request body (JSON):
 *   {
 *     "messages": [...],  // conversation including prior tool_call messages
 *     "system": "...",
 *     "tools": [...],     // OpenAI tool schema OR Anthropic tool schema
 *     "temperature": 0.7
 *   }
 *
 * Response: the LLM provider's response, including any tool_calls.
 */

import { error } from '@sveltejs/kit';
import { proxyChatCompletion } from '../_lib.js';
import type { RequestHandler } from './$types';

interface ToolsRequestBody {
  readonly messages: readonly { role: string; content: string }[];
  readonly system?: string;
  readonly temperature?: number;
  readonly maxTokens?: number;
  readonly tools: readonly unknown[];
}

export const POST: RequestHandler = async ({ request }) => {
  let body: ToolsRequestBody;

  try {
    body = await request.json();
  } catch {
    throw error(400, 'Invalid JSON body');
  }

  if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
    throw error(400, 'Missing required field: messages (must be non-empty array)');
  }

  if (!body.tools || !Array.isArray(body.tools) || body.tools.length === 0) {
    throw error(400, 'Missing required field: tools (must be non-empty array for /api/llm/tools)');
  }

  return proxyChatCompletion(body);
};
