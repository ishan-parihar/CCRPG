/**
 * ponytail: PersistentAgentBridge removed with PersistentAgent.
 * Stub preserves the import site. The CLI's USE_PERSISTENT_AGENT branch
 * is never taken, so this function is never called.
 */

import type { PersistentAgent } from './PersistentAgent.js';

export async function runPersistentAgentEncounter(
  _agent: PersistentAgent | null,
  ..._args: unknown[]
): Promise<never> {
  throw new Error('runPersistentAgentEncounter removed — USE_PERSISTENT_AGENT is always false');
}
