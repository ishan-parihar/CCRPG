/**
 * LLMClient — thin wrapper around a chat-completions endpoint.
 * Used for open-ended response evaluation in later-stage probes.
 */

import type { Stage } from '../../core/domain/Stage.js';
import type { AgentMessage, ToolCall } from '../../core/assessments/agentTypes.js';

export interface LLMEvaluation {
  readonly score: number;
  readonly feedback: string;
  readonly inferredStage?: Stage;
  readonly confidence?: number;
}

const FALLBACK: LLMEvaluation = { score: 0.5, feedback: 'LLM unavailable' };

function getEnvVal(key: string): string | undefined {
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    // @ts-ignore
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key];
  }
  return undefined;
}

export async function evaluateResponse(
  prompt: string,
  rubric: string,
  playerResponse: string,
): Promise<LLMEvaluation> {
  const baseUrl = getEnvVal('VITE_LLM_BASE_URL');
  const apiKey = getEnvVal('VITE_LLM_API_KEY');
  const model = getEnvVal('VITE_LLM_MODEL');

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
  const baseUrl = getEnvVal('VITE_LLM_BASE_URL');
  const apiKey = getEnvVal('VITE_LLM_API_KEY');
  const model = getEnvVal('VITE_LLM_MODEL');

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

export interface LLMToolResponse {
  readonly content: string | null;
  readonly toolCalls?: readonly ToolCall[];
}

export async function queryLLMWithTools(
  systemPrompt: string,
  messages: readonly AgentMessage[],
  tools?: readonly any[],
): Promise<LLMToolResponse> {
  const baseUrl = getEnvVal('VITE_LLM_BASE_URL');
  const apiKey = getEnvVal('VITE_LLM_API_KEY');
  const model = getEnvVal('VITE_LLM_MODEL');

  if (!baseUrl || !apiKey || apiKey === 'sk-placeholder' || !model) {
    return { content: '{"error": "LLM unavailable"}' };
  }

  // Map AgentMessage to OpenAI API format
  const mappedMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.map(msg => {
      const result: any = {
        role: msg.role,
        content: msg.content,
      };
      if (msg.toolCalls) {
        result.tool_calls = msg.toolCalls.map(tc => ({
          id: tc.id,
          type: tc.type,
          function: {
            name: tc.function.name,
            arguments: tc.function.arguments,
          },
        }));
      }
      if (msg.toolCallId) {
        result.tool_call_id = msg.toolCallId;
      }
      if (msg.name) {
        result.name = msg.name;
      }
      return result;
    }),
  ];

  try {
    const body: any = {
      model,
      messages: mappedMessages,
      temperature: 0.7,
    };
    if (tools && tools.length > 0) {
      body.tools = tools;
    }

    const res = await fetch(`${baseUrl}/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      return { content: `{"error": "fetch error: ${res.status}"}` };
    }

    const data = (await res.json()) as {
      choices: {
        message: {
          content: string | null;
          tool_calls?: {
            id: string;
            type: 'function';
            function: {
              name: string;
              arguments: string;
            };
          }[];
        };
      }[];
    };

    const choice = data.choices[0]?.message;
    if (!choice) {
      return { content: null };
    }

    return {
      content: choice.content,
      toolCalls: choice.tool_calls?.map(tc => ({
        id: tc.id,
        type: tc.type,
        function: {
          name: tc.function.name,
          arguments: tc.function.arguments,
        },
      })),
    };
  } catch (err: any) {
    return { content: `{"error": "exception: ${err.message || err}"}` };
  }
}

