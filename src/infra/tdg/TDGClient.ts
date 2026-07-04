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
    timeoutHandle: ReturnType<typeof setTimeout>;
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

    // BUG FIX: tdg-rust v0.6.0+ does NOT accept `--stdio`. The `serve` subcommand
    // defaults to port 3000 which IS stdio mode (per `tdg-rust serve --help`).
    // Passing `--stdio` causes the binary to exit immediately with
    // "error: unexpected argument '--stdio' found", and the MCP handshake hangs
    // for 30s until our request timeout fires.
    //
    // BUG FIX: tdg-rust dynamically links against libonnxruntime.so.1, which the
    // install script places in <hermes_home>/tdg-rust/lib/. The install script's
    // own init_database step fails to set LD_LIBRARY_PATH (a bug in install.sh),
    // and our spawn inherits process.env — so we must explicitly inject the lib
    // dir here or the binary fails with "error while loading shared libraries:
    // libonnxruntime.so.1: cannot open shared object file".
    const libDir = path.join(path.dirname(this.binaryPath), 'lib');
    this.process = spawn(this.binaryPath, ['serve'], {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: {
        ...process.env,
        TDG_HOME: path.dirname(path.dirname(this.dbPath)),
        TDG_DB_PATH: this.dbPath,
        NO_COLOR: '1',
        // Prepend our lib dir to any existing LD_LIBRARY_PATH so the dynamic
        // linker finds libonnxruntime. This mirrors the LD_LIBRARY_PATH the
        // install.sh script uses in its own (broken) init_database step.
        LD_LIBRARY_PATH: [libDir, process.env.LD_LIBRARY_PATH].filter(Boolean).join(':'),
      },
    });

    this.process.stdout?.on('data', (data: Buffer) => {
      this.buffer += data.toString();
      this.processBuffer();
    });

    this.process.stderr?.on('data', (data: Buffer) => {
      // L3: TDG-Rust logs INFO messages + crash diagnostics to stderr. Route
      // these to console.debug when CCRPG_VERBOSE_TDG is set so developers can
      // debug hook failures + binary load errors. Otherwise discard (hooks are
      // best-effort; we must not spam the player's console with TDG internals).
      if (process.env.CCRPG_VERBOSE_TDG === '1' || process.env.CCRPG_VERBOSE === '1') {
        const text = data.toString().trim();
        if (text) console.debug(`[tdg-rust] ${text}`);
      }
    });

    this.process.on('error', (err: Error) => {
      // Spawn error (binary missing, permission denied, etc.)
      this.available = false;
      this.rejectAllPending(`TDG process error: ${err.message}`);
    });

    this.process.on('exit', (code: number | null) => {
      // Process exited — reject all in-flight requests so callers don't hang
      // for the full 30s timeout. This is critical for graceful shutdown.
      this.available = false;
      this.process = null;
      this.rejectAllPending(`TDG process exited (code=${code})`);
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
    // Reject any in-flight requests so callers don't hang
    this.rejectAllPending('TDG client stopped');
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

      // Store the timeout handle so we can clearTimeout it when the response
      // arrives (otherwise every request leaks a 30s timer + closure refs).
      const timeoutHandle = setTimeout(() => {
        if (this.pendingRequests.has(id)) {
          this.pendingRequests.delete(id);
          reject(new Error(`TDG request ${method} timed out after 30s`));
        }
      }, 30000);

      this.pendingRequests.set(id, { resolve, reject, timeoutHandle });

      const json = JSON.stringify(request) + '\n';
      this.process?.stdin?.write(json);
    });
  }

  /**
   * Reject all in-flight requests with the given reason.
   * Called when the TDG process exits or errors, so callers don't hang
   * for the full 30s timeout on each pending request.
   */
  private rejectAllPending(reason: string): void {
    for (const [id, pending] of this.pendingRequests) {
      clearTimeout(pending.timeoutHandle);
      this.pendingRequests.delete(id);
      pending.reject(new Error(reason));
    }
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
          // Clear the timeout to prevent the timer leak (bug #12)
          clearTimeout(pending.timeoutHandle);
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
