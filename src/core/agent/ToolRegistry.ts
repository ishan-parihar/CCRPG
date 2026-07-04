/**
 * ToolRegistry — registers all agent-callable tools (CCRPG-native + TDG-Mind).
 *
 * The PersistentAgent queries this registry to build the tool list for the
 * LLM and to dispatch tool calls to the appropriate handler.
 */
import type { ToolDefinition } from './tools/CCRPGTools.js';
import { ALL_CCRPG_TOOLS, executeCCRPGTool, type ToolContext } from './tools/CCRPGTools.js';

export interface RegisteredTool {
  readonly definition: ToolDefinition;
  readonly handler: (args: Record<string, unknown>, ctx: ToolContext) => Promise<string>;
  readonly source: 'ccrpg' | 'tdg';
}

export class ToolRegistry {
  private tools = new Map<string, RegisteredTool>();

  /** Register a tool by name. */
  register(tool: RegisteredTool): void {
    this.tools.set(tool.definition.function.name, tool);
  }

  /** Get all registered tool definitions (for the LLM's tool list). */
  getDefinitions(): readonly ToolDefinition[] {
    return Array.from(this.tools.values()).map(t => t.definition);
  }

  /** Get all definitions from a specific source. */
  getDefinitionsBySource(source: 'ccrpg' | 'tdg'): readonly ToolDefinition[] {
    return Array.from(this.tools.values())
      .filter(t => t.source === source)
      .map(t => t.definition);
  }

  /** Execute a tool call by name. */
  async execute(
    name: string,
    args: Record<string, unknown>,
    ctx: ToolContext,
  ): Promise<string> {
    const tool = this.tools.get(name);
    if (!tool) {
      return JSON.stringify({ error: `Unknown tool: ${name}` });
    }
    try {
      return await tool.handler(args, ctx);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      return JSON.stringify({ error: `Tool ${name} failed: ${msg}` });
    }
  }

  /** Check if a tool is registered. */
  has(name: string): boolean {
    return this.tools.has(name);
  }

  /** Get all registered tool names. */
  getToolNames(): readonly string[] {
    return Array.from(this.tools.keys());
  }

  /** Get count of registered tools. */
  get count(): number {
    return this.tools.size;
  }
}

/**
 * Create a ToolRegistry with all CCRPG-native tools pre-registered.
 * TDG-Mind tools are added separately when TDG-Rust is available.
 */
export function createCCRPGToolRegistry(): ToolRegistry {
  const registry = new ToolRegistry();

  for (const def of ALL_CCRPG_TOOLS) {
    registry.register({
      definition: def,
      handler: (args, ctx) => executeCCRPGTool(def.function.name, args, ctx),
      source: 'ccrpg',
    });
  }

  return registry;
}
