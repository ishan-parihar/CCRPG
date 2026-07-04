/**
 * TDGClient — MCP client for communicating with the TDG-Rust binary.
 *
 * TDG-Rust (Teleological Developmental Graph) is a persistent memory
 * infrastructure that implements the HoloOS ontology. It runs as a
 * separate process (Rust binary) and communicates via MCP (stdio or HTTP-SSE).
 *
 * This client provides:
 * - spawn/spawn management for the tdg-rust binary
 * - MCP tool call dispatch (send request → receive response)
 * - Health check / availability detection
 *
 * Status: canonical-hypothesis (CCRPG-specific integration per AGENTIC-ARCHITECTURE-PLAN.md).
 */
import { spawn, type ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface TDGMCPRequest {
  readonly jsonrpc: '2.0';
  readonly id: number;
  readonly method: string;
  readonly params?: Record<string, unknown>;
}

export interface TDGMCPResponse {
  readonly jsonrpc: '2.0';
  readonly id: number;
  readonly result?: unknown;
  readonly error?: { readonly code: number; readonly message: string };
}

export interface TDGToolDef {
  readonly name: string;
  readonly description: string;
  readonly inputSchema: Record<string, unknown>;
}

export class TDGClient {
  private process: ChildProcess | null = null;
  private requestId = 0;
  private pendingRequests = new Map<number, {
    resolve: (value: unknown) => void;
    reject: (error: Error) => void;
  }>();
  private buffer = '';
  private available = false;
  private tools: TDGToolDef[] = [];
  private readonly binaryPath: string;
  private readonly dbPath: string;

  constructor(binaryPath?: string, dbPath?: string) {
    // Default paths based on HoloOS install structure
    this.binaryPath = binaryPath ?? path.join(process.env.HOME ?? '/home/z', '.hermes', 'tdg-rust', 'tdg-rust');
    this.dbPath = dbPath ?? path.join(process.env.HOME ?? '/home/z', '.hermes', 'tdg', 'graph.db');
  }

  /** Check if TDG-Rust binary exists. */
  isAvailable(): boolean {
    return fs.existsSync(this.binaryPath);
  }

  /** Start the TDG-Rust MCP server process. */
  async start(): Promise<void> {
    if (!this.isAvailable()) {
      throw new Error(`TDG-Rust binary not found at ${this.binaryPath}. Install with: curl -fsSL https://raw.githubusercontent.com/ishan-parihar/tdg-rust/main/install.sh | bash`);
    }

    this.process = spawn(this.binaryPath, ['serve', '--stdio'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        TDG_HOME: path.dirname(path.dirname(this.dbPath)),
        TDG_DB_PATH: this.dbPath,
        NO_COLOR: '1',
      },
    });

    this.process.stdout?.on('data', (data: Buffer) => {
      this.buffer += data.toString();
      this.processBuffer();
    });

    this.process.stderr?.on('data', (data: Buffer) => {
      // TDG-Rust logs to stderr — ignore unless debugging
      void data;
    });

    this.process.on('error', () => {
      this.available = false;
    });

    this.process.on('exit', () => {
      this.available = false;
      this.process = null;
    });

    // Wait for the server to be ready (initialize handshake)
    await this.initialize();
    this.available = true;
  }

  /** Stop the TDG-Rust process. */
  stop(): void {
    if (this.process) {
      this.process.kill('SIGTERM');
      this.process = null;
    }
    this.available = false;
  }

  /** Check if the TDG server is running and ready. */
  isRunning(): boolean {
    return this.available && this.process !== null;
  }

  /** Get the list of available TDG tools (for registration). */
  getTools(): readonly TDGToolDef[] {
    return this.tools;
  }

  /** Call a TDG MCP tool by name. */
  async callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
    if (!this.isRunning()) {
      return { error: 'TDG-Rust is not running' };
    }

    return this.sendRequest('tools/call', {
      name,
      arguments: args,
    });
  }

  // --- Internal MCP protocol ---

  private async initialize(): Promise<void> {
    // Send initialize request
    await this.sendRequest('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'ccrpg', version: '0.1.0' },
    });

    // Send initialized notification
    this.sendNotification('notifications/initialized', {});

    // Fetch available tools
    const toolsResult = await this.sendRequest('tools/list', {}) as { tools?: TDGToolDef[] };
    this.tools = toolsResult?.tools ?? [];
  }

  private sendRequest(method: string, params: Record<string, unknown>): Promise<unknown> {
    return new Promise((resolve, reject) => {
      const id = ++this.requestId;
      const request: TDGMCPRequest = {
        jsonrpc: '2.0',
        id,
        method,
        params,
      };

      this.pendingRequests.set(id, { resolve, reject });

      const json = JSON.stringify(request) + '\n';
      this.process?.stdin?.write(json);

      // Timeout after 30 seconds
      setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`TDG request ${method} timed out after 30s`));
        }
      }, 30000);
    });
  }

  private sendNotification(method: string, params: Record<string, unknown>): void {
    const notification = {
      jsonrpc: '2.0',
      method,
      params,
    };
    const json = JSON.stringify(notification) + '\n';
    this.process?.stdin?.write(json);
  }

  private processBuffer(): void {
    const lines = this.buffer.split('\n');
    this.buffer = lines.pop() ?? ''; // Keep incomplete last line in buffer

    for (const line of lines) {
      if (!line.trim()) continue;
      try {
        const response = JSON.parse(line) as TDGMCPResponse;
        const pending = this.pendingRequests.get(response.id);
        if (pending) {
          this.pendingRequests.delete(response.id);
          if (response.error) {
            pending.reject(new Error(response.error.message));
          } else {
            pending.resolve(response.result);
          }
        }
      } catch {
        // Not a valid JSON-RPC response — ignore
      }
    }
  }
}
