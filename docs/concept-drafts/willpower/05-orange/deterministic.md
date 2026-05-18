# Willpower / Orange — Deterministic Game Concept

> **Axis:** Objective willpower measurement — delay discounting, sustained attention, goal-persistence metrics.  **Why this axis for this module:** Achievement-will must be measured through behavioral persistence independent of narrative, language, or social context.

---

## 1. Game Identity

**Name:** The Long Road  
**Core loop:** Player pursues multi-session resource-accumulation goals with calibrated temptation points offering immediate smaller rewards vs. continued pursuit of larger delayed rewards. Pure behavioral economics of will.  
**Session length:** 3–12 minutes (checkpoint every 90 seconds).  
**Infinite checkpoint:** Yes — every temptation-point is a valid exit.

## 2. Catalyst Delivery

**Catalyst frequency:** Orange willpower — rational delayed gratification as chosen strategy.  
**Shadow surfacing:** DA surfaces as inability to take offered rest-rewards (always choosing "more"). DAll surfaces as consistent preference for immediate small rewards over any sustained pursuit. GAll surfaces as rigid goal-lock even when adaptive switching would yield better outcomes. GA surfaces as premature goal-abandonment framed as "I don't need this."  
**Drive probing:** Eros measured via reach-toward-harder-goals. Agape via voluntary rest-taking. Agency via self-selected goal-difficulty. Communion via acceptance of shared-progress multipliers.

## 3. Game Design

**Mechanic 1 — Delay Discounting Staircase:** Adaptive binary choices between smaller-sooner and larger-later rewards. Staircase converges on individual discount rate. Tracked across sessions to measure trait-level will.  
**Mechanic 2 — Sustained Attention to Goal:** A goal-meter fills over time with periodic attention-checks (respond within window to confirm pursuit). Miss rate = attention-to-goal decay. DA: never misses, plays through fatigue signals. DAll: high miss rate, disengages.  
**Mechanic 3 — Goal-Persistence Under Interference:** Distractors offer side-quests with immediate payoff. Ratio of goal-maintenance to distractor-pursuit = persistence index. Adaptive difficulty: distractors become more attractive as persistence rises.  
**Mechanic 4 — Voluntary Rest Integration:** Rest-points offer recovery that improves subsequent performance. DA players skip rest (short-term loss, long-term cost). Optimal play requires strategic rest — measuring whether player can stop.

## 4. Item Pool

| Item Type | Count | Adaptive Range | Shadow Diagnostic |
|---|---|---|---|
| Delay-discounting pairs | 200+ | 1 min – 30 day equivalent | DA: extreme patience; DAll: extreme impatience |
| Attention-check intervals | Variable | 5s – 60s gaps | DA: hypervigilance; DAll: dropout |
| Distractor offerings | 100+ | Low–high attractiveness | GAll: never takes; GA: always takes |
| Rest-point configurations | 50+ | Short–long recovery | DA: skips all; healthy: strategic use |

## 5. Technical Requirements

**State persistence:** Multi-session goal-progress stored server-side. Discount-rate history (rolling 30-day window). Persistence-index trend.  
**Adaptive engine:** Staircase algorithm (QUEST+) for discount rate. Distractor attractiveness calibrated to 60% resistance threshold.  
**Scoring outputs:** Delay-discount k-value, persistence index, rest-utilization ratio, goal-completion rate. All feed drive-health and shadow-drag calculations per module-spec §5.  
**No dependencies:** Pure behavioral — no LLM, no language input, no social component, no somatic tracking.
