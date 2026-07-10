# CCRPG UX Audit Implementation — Progress Tracker

> Tracking active-progress / pending-progress / completed-progress for the 18 recommendations
> from the Fresh-User UX Audit. Updated after each iteration.
>
> **Iteration protocol (AGENTS.md §7.5):**
> 1. Make changes (code, docs, config)
> 2. Run workspace-lint: `python3 skills/workspace-lint/scripts/workspace_lint.py --root .`
> 3. Run build + tests: `npm run build && npm test`
> 4. Fix any violations
> 5. Git commit + push to BOTH remotes (`git push origin main && git push gitlab main`)

## Status Legend
- ⏳ PENDING — not started
- 🔄 IN-PROGRESS — actively being worked on
- ✅ COMPLETED — implemented, tested, committed, pushed
- ❌ BLOCKED — hit an issue that needs decision

## Architectural Preferences (carry forward across iterations)
1. **Veil principle is sacred** (AGENTS.md §5.4): game is NEVER diagnostic to user. All player-facing surfaces must route through VeilFilter.
2. **CLI is first-class** (PONYTAIL-AUDIT-v2): CLI is not a debug tool — it's a primary game surface alongside WebUI.
3. **Theory is exhaustive** — the gap is not in theory, it's in implementation. Add code, not docs.
4. **YAGNI**: cut dead weight ruthlessly. PONYTAIL-AUDIT-v2 already identified the cuts.
5. **No regressions**: every iteration must keep all 604 tests passing.
6. **Commit discipline**: one logical change per commit. Push to BOTH remotes after each.

## P0 — Critical (4 items)

| # | ID | Title | Dim | Effort | Status | Commit |
|---|-----|-------|-----|--------|--------|--------|
| 1 | BUG | LLM bypass for 7/8 encounters in session 2 (investigation) | Tech | Med | ⏳ | — |
| 2 | R4 | Verbose mode merged into dev mode | Exp | Low | ⏳ | — |
| 3 | R1 | Profile show rewrite as narrative letter | Exp | Med | ⏳ | — |
| 4 | U2 | Integration ritual at session end | Eff | High | ⏳ | — |

## P1 — High Priority (6 items)

| # | ID | Title | Dim | Effort | Status | Commit |
|---|-----|-------|-----|--------|--------|--------|
| 5 | Y4 | Cut CCI numeric display in non-dev contexts | Exp | Low | ⏳ | — |
| 6 | R2 | Status page de-quantification | Exp | Low | ⏳ | — |
| 7 | U4 | Felt-sense indicators replace clinical metrics | Exp+Eff | Med | ⏳ | — |
| 8 | F1 | VeilFilter expansion to all CLI surfaces | Exp | Med | ⏳ | — |
| 9 | U1 | Embodied pause protocol (30s breath cue) | Eff | Med | ⏳ | — |
| 10 | U3 | Catalyst mode LLM prompts | Eff | High | ⏳ | — |
| 11 | R5 | Session runtime cap with thinking indicator | Exp | Med | ⏳ | — |

## P2 — Medium Priority (6 items)

| # | ID | Title | Dim | Effort | Status | Commit |
|---|-----|-------|-----|--------|--------|--------|
| 12 | Y5 | Cut per-line stage bars in status | Exp | Low | ⏳ | — |
| 13 | U5 | Progressive vocabulary unlock | Exp | Med | ⏳ | — |
| 14 | R3 | Glossary testimonials replace clinical definitions | Exp | Med | ⏳ | — |
| 15 | F2 | Profile system split (player-owned vs game-observed) | Exp+Eff | High | ⏳ | — |
| 16 | F3 | Session loop restructure (breath → question → reflection) | Eff | High | ⏳ | — |

## P3 — Low Priority (3 items; Y3 is already done)

| # | ID | Title | Dim | Effort | Status | Commit |
|---|-----|-------|-----|--------|--------|--------|
| 17 | Y1 | Cut 36 unreferenced TTF files | Tech | Low | ⏳ | — |
| 18 | Y2 | Cut 9 dead usecase files | Tech | Low | ⏳ | — |
| 19 | Y3 | Hide --force-shadow (already done) | Exp | Zero | ✅ | (existing) |

## Iteration Log

(iterations appended below as work proceeds)
