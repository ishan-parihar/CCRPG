/**
 * ponytail: PersistentAgent / Story-Driven mode was removed (YAGNI-EFF-3).
 * USE_PERSISTENT_AGENT is always false in the CLI. This stub preserves
 * the import site so cli-game.ts compiles. The constructor accepts any
 * config (ignored) so the `new PersistentAgent({...})` call site type-checks.
 * If Story-Driven mode is ever revived, replace this file with a real
 * PersistentAgent implementation.
 */

export class PersistentAgent {
  readonly id = 'stub';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
  constructor(_config: any) {}
}
