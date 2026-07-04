/**
 * TDGToolAdapter — wraps TDG-Rust MCP tools as agent-callable tools.
 *
 * When TDG-Rust is available, this adapter:
 * 1. Fetches the tool list from the TDG MCP server
 * 2. Wraps each tool as a ToolDefinition + handler
 * 3. Registers them in the ToolRegistry alongside CCRPG-native tools
 *
 * The agent then sees a unified tool surface (8 CCRPG + 7 TDG = 15 tools)
 * and can call any tool seamlessly.
 *
 * ── MCP response envelope ──
 * tdg-rust v0.6.0 returns tool results in the standard MCP shape:
 *   { content: [{ type: "text", text: "<json-string>" }], isError: false }
 * The handler must extract the inner text from the content array and return
 * it as a string (the agent's message history expects string tool results).
 * Earlier versions of this adapter returned `result.content` directly, which
 * is the ARRAY — that corrupted the agent's message history because the
 * array got pushed into AgentMessage.content (typed as `string | null`).
 *
 * Status: canonical-hypothesis (CCRPG-specific integration per AGENTIC-ARCHITECTURE-PLAN.md).
 */
import type { ToolDefinition } from '../../core/agent/tools/CCRPGTools.js';
import type { ToolContext } from '../../core/agent/tools/CCRPGTools.js';
import { TDGClient } from './TDGClient.js';

// The TDG-Mind tools exposed to CCRPG's agent.
// P1-13: Expanded from 7 to 10 tools — added tdg_greater_cycle (query/advance
// the greater cycle), tdg_consolidate (sleep replay), and tdg_save_mind_state
// (persist graph). These were previously used only in hooks (onTransformation,
// onSessionEnd) but not agent-callable. Now the agent can:
//   - Query the greater cycle (readiness, phase, transformation pressure)
//   - Trigger consolidation mid-session (sleep replay for integration)
//   - Save mind state on demand (e.g. before a risky encounter)
const TDG_AGENT_TOOLS = new Set([
  // Graph memory (original 7)
  'tdg_search',
  'tdg_create',
  'tdg_connect',
  'tdg_reflect',
  'tdg_fetch_context',
  'tdg_tick',
  'tdg_health',
  // P1-13: Greater cycle + consolidation + persistence (new 3)
  'tdg_greater_cycle',
  'tdg_consolidate',
  'tdg_save_mind_state',
]);

export interface AdaptedTDGTool {
  readonly definition: ToolDefinition;
  readonly handler: (args: Record<string, unknown>, ctx: ToolContext) => Promise<string>;
  readonly source: 'tdg';
}

/**
 * Extract the text payload from an MCP tool-result envelope.
 *
 * MCP shape: { content: [{ type: "text", text: "..." }, ...], isError: false }
 * Returns the concatenated text from all text blocks. If `isError` is true,
 * returns `{ error: ... }` JSON so the agent can see the tool failed.
 */
function extractMCPContent(result: unknown): string {
  if (!result || typeof result !== 'object') {
    return JSON.stringify(result);
  }
  const r = result as { content?: unknown; isError?: boolean };

  // If the tool returned an error, surface it as JSON
  if (r.isError === true) {
    return JSON.stringify({ error: 'TDG tool returned isError=true', raw: r });
  }

  // Standard MCP envelope: extract text from content blocks
  if (Array.isArray(r.content)) {
    const texts: string[] = [];
    for (const block of r.content) {
      if (block && typeof block === 'object') {
        const b = block as { type?: string; text?: string };
        if (b.type === 'text' && typeof b.text === 'string') {
          texts.push(b.text);
        }
      }
    }
    if (texts.length > 0) {
      return texts.join('\n');
    }
  }

  // Fallback: result.content is a string (older shape)
  if (typeof r.content === 'string') {
    return r.content;
  }

  // Fallback: result itself is the payload
  return JSON.stringify(result);
}

/**
 * Adapt TDG-Rust's MCP tools into agent-callable tools.
 * Only the 7 most relevant tools are exposed to the CCRPG agent.
 */
export function adaptTDGTools(client: TDGClient): AdaptedTDGTool[] {
  const tdgTools = client.getTools();
  const adapted: AdaptedTDGTool[] = [];

  for (const tool of tdgTools) {
    if (!TDG_AGENT_TOOLS.has(tool.name)) continue;

    adapted.push({
      definition: {
        type: 'function',
        function: {
          name: tool.name,
          description: tool.description,
          parameters: tool.inputSchema,
        },
      },
      handler: async (args) => {
        try {
          const result = await client.callTool(tool.name, args);
          // Extract the text payload from the MCP envelope — return as a STRING
          // (the agent's message history expects string tool results, not arrays).
          return extractMCPContent(result);
        } catch (err) {
          const msg = err instanceof Error ? err.message : String(err);
          return JSON.stringify({ error: `TDG tool ${tool.name} failed: ${msg}` });
        }
      },
      source: 'tdg',
    });
  }

  return adapted;
}

/**
 * Check if TDG-Rust is available (binary exists).
 */
export function isTDGAvailable(binaryPath?: string): boolean {
  const client = new TDGClient(binaryPath);
  return client.isAvailable();
}
