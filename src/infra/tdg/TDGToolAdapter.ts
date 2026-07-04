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
 * Status: canonical-hypothesis (CCRPG-specific integration per AGENTIC-ARCHITECTURE-PLAN.md).
 */
import type { ToolDefinition } from '../../core/agent/tools/CCRPGTools.js';
import type { ToolContext } from '../../core/agent/tools/CCRPGTools.js';
import { TDGClient } from './TDGClient.js';

// The 7 TDG-Mind tools that are most relevant for CCRPG's agent.
const TDG_AGENT_TOOLS = new Set([
  'tdg_search',
  'tdg_create',
  'tdg_connect',
  'tdg_reflect',
  'tdg_fetch_context',
  'tdg_tick',
  'tdg_health',
]);

export interface AdaptedTDGTool {
  readonly definition: ToolDefinition;
  readonly handler: (args: Record<string, unknown>, ctx: ToolContext) => Promise<string>;
  readonly source: 'tdg';
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
          // TDG returns results as { content: string } — extract the content
          if (typeof result === 'object' && result !== null && 'content' in result) {
            return (result as { content: string }).content;
          }
          return JSON.stringify(result);
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
