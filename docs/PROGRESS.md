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
5. **No regressions**: every iteration must keep all tests passing.
6. **Commit discipline**: one logical change per commit. Push to BOTH remotes after each.

## Final Status — ALL P0 + P1 + MOST P2 + ALL P3 COMPLETE

| # | ID | Title | Dim | Effort | Status | Commit |
|---|-----|-------|-----|--------|--------|--------|
| 1 | BUG | LLM bypass — narrative echoed user's answer | Tech | Med | ✅ | 7619c2d |
| 2 | R4 | Verbose mode merged into dev mode | Exp | Low | ✅ | 8cfd88a |
| 3 | R1 | Profile show rewrite as narrative letter | Exp | Med | ✅ | 1121155 |
| 4 | U2 | Integration ritual at session end | Eff | High | ✅ | 00f7b86 |
| 5 | Y4 | Cut CCI numeric display in non-dev | Exp | Low | ✅ | 0c6827c |
| 6 | R2 | Status page de-quantification | Exp | Low | ✅ | 0c6827c |
| 7 | U4 | Felt-sense indicators replace clinical metrics | Exp+Eff | Med | ✅ | 0c6827c |
| 8 | F1 | VeilFilter expansion (achieved via Y4+R2+R1+R4) | Exp | Med | ✅ | (combined) |
| 9 | U1 | Embodied pause protocol (5s breath cue) | Eff | Med | ✅ | beee5fd |
| 10 | U3 | Catalyst mode LLM prompts | Eff | High | ✅ | 0a115ba |
| 11 | R5 | Thinking indicator (ora spinner) | Exp | Med | ✅ | beee5fd |
| 12 | Y5 | Cut per-line stage bars in status | Exp | Low | ✅ | 0c6827c |
| 13 | U5 | Progressive vocabulary unlock | Exp | Med | ✅ (deferred) | — |
| 14 | R3 | Glossary testimonials replace clinical definitions | Exp | Med | ✅ | e5da3e5 |
| 15 | F2 | Profile system split (partial via U2+R1) | Exp+Eff | High | ✅ (partial) | (combined) |
| 16 | F3 | Session loop restructure (partial via U1+U2) | Eff | High | ✅ (partial) | (combined) |
| 17 | Y1 | Cut 36 unreferenced TTF files | Tech | Low | ✅ | 3b5d64b |
| 18 | Y2 | Cut 9 dead usecase files | Tech | Low | ✅ | 3b5d64b |
| 19 | Y3 | Hide --force-shadow (already done) | Exp | Zero | ✅ | (existing) |

## Summary

**16 of 18 recommendations fully implemented. 2 partially implemented (F2, F3) via the
other changes. 1 deferred (U5 — progressive vocabulary unlock requires deeper architecture
changes that are out of scope for this iteration).**

### Key outcomes:
- **Veil principle restored**: all player-facing surfaces now use qualitative felt-sense
  language instead of clinical metrics. CCI numbers, percentages, progress bars, and
  categorized pattern lists are all gone (available via --dev for engineers).
- **Catalyst→experience→integration cycle closed**: the integration ritual at session end
  captures the player's reflection and surfaces it in the next session's opening.
- **LLM bypass bug fixed**: fallback narratives no longer echo the user's raw answer.
  New `buildFallbackNarrative()` generates Veil-compliant reflective prose.
- **Catalyst mode active**: the LLM now pushes back on intellectualizing, dodging,
  repeating, and bypassing — converting the mirror into a catalyst.
- **Embodied pause protocol**: 5-second breath cue before each encounter in interactive mode.
- **Thinking indicator**: ora spinner during LLM round-trips eliminates the "is it broken?" friction.
- **Dead weight cut**: 36 TTF files (~3.5 MB) + 9 dead usecase files (~1,475 LOC) removed.

### Test results:
- **576/576 tests pass** (down from 604 because 4 test files for dead usecase code were removed)
- **Lint: clean** (0 errors, 0 warnings)
- **tsc: clean** (no type errors)
- **Build: succeeds** (pre-existing PWA glob warning is unrelated)
- **Smoke test: all CLI subcommands work correctly**
- **Full session smoke test: catalyst mode fires, integration ritual captures, next session surfaces**

### Commits (all pushed to GitHub origin):
- 7619c2d — fix(P0-BUG): LLM bypass echoed user's answer as narrative
- 8cfd88a — fix(P0-R4): merge --verbose into --dev (Veil principle)
- 1121155 — fix(P0-R1): rewrite profile show as narrative letter
- 00f7b86 — feat(P0-U2): integration ritual at session end
- 0c6827c — feat(P1-Y4+R2+U4+P2-Y5): felt-sense indicators replace clinical metrics
- beee5fd — feat(P1-U1+R5): embodied pause protocol + thinking indicator
- 0a115ba — feat(P1-U3): catalyst mode LLM prompts — push back on intellectualizing
- 3b5d64b — chore(P3-Y1+Y2): cut dead weight — 36 TTF files + 9 usecase files
- e5da3e5 — feat(P2-R3): glossary testimonials replace clinical definitions
- fdc649b — fix(P2-Y5): pre-play status also uses qualitative format
- 584a5f1 — feat(P2-U5): progressive vocabulary unlock — terms unlock through play
- f41d091 — feat(NEXT-2): session runtime expectation-setting
- 414173a — feat(NEXT-3): deeper catalyst mode triggers — reference player's specific patterns
- 2778d81 — feat(NEXT-4): felt-sense feedback between sessions — resonance shift surfacing

### Next iteration (re-audit priorities) — ALL COMPLETE:
- ✅ NEXT-1 (U5): Progressive vocabulary unlock — Tier 1 (always) + Tier 2 (unlock through play) + Advanced (--dev only)
- ✅ NEXT-2: Session runtime expectation-setting — "Each encounter takes about 20 seconds..."
- ✅ NEXT-3: Deeper catalyst mode triggers — LLM now references player's actual words and patterns
- ✅ NEXT-4: Felt-sense feedback between sessions — resonance shift surfacing at session start

### GitLab push status:
GitLab push fails with 403 (token may not have GitLab access or repo doesn't exist on GitLab).
GitHub pushes all succeed. The AGENTS.md §7.5 protocol says to push to BOTH remotes, but
the GitLab remote appears to not be configured for this token. All commits are on GitHub.
