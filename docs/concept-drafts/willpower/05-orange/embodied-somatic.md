# Willpower / Orange — Embodied-Somatic Game Concept

> **Axis:** Body as site of will — physical persistence, fatigue management, embodied goal-pursuit.  **Why this axis for this module:** Achievement-will lives in the body before it lives in the mind — the soma reveals will-patterns that cognition conceals.

---

## 1. Game Identity

**Name:** The Forge  
**Core loop:** Player engages in rhythm-based physical persistence challenges (tap sequences, hold patterns, breath-gated exertion) that require sustained bodily effort across escalating difficulty. Fatigue signals are real; how the player relates to them is diagnostic.  
**Session length:** 3–8 minutes (physical fatigue limits natural session length).  
**Infinite checkpoint:** Yes — each exertion cycle is a valid exit.

## 2. Catalyst Delivery

**Catalyst frequency:** Orange willpower — the body's relationship to sustained effort and strategic rest.  
**Shadow surfacing:** DA surfaces as pushing through ALL fatigue signals, refusing recovery phases, treating body as machine. DAll surfaces as disengagement at first discomfort, inability to sustain even moderate effort. GA surfaces as premature "body wisdom" claims — stopping before genuine effort begins. GAll surfaces as rigid effort patterns — same intensity regardless of fatigue state, cannot modulate.  
**Drive probing:** Eros via reaching toward harder physical challenges. Agape via honoring recovery needs. Agency via self-paced effort selection. Communion via synchronized group rhythms (when available).

## 3. Game Design

**Mechanic 1 — Escalating Persistence:** Tap/hold sequences increase in duration and complexity. Player chooses when to advance difficulty. Optimal: push to genuine edge, then recover. DA: never stops advancing. DAll: stays at lowest tier.  
**Mechanic 2 — Fatigue-Signal Integration:** Game detects declining performance (slower taps, missed beats) and offers recovery windows. Taking recovery = faster subsequent performance. DA players skip recovery (measurable performance cost). Healthy players optimize effort/rest ratio.  
**Mechanic 3 — Breath-Gated Effort:** Certain challenges require breath-timing (inhale to charge, exhale to execute). Forces somatic awareness INTO the effort. Cannot brute-force — must integrate body-state with goal-pursuit.  
**Mechanic 4 — Embodied Goal-Selection:** Player sets physical targets before each cycle ("I will sustain for X beats"). Accuracy of self-prediction = somatic self-knowledge. DA over-predicts (sets impossible targets). DAll under-predicts (avoids challenge).

## 4. Item Pool

| Item Type | Count | Adaptive Range | Shadow Diagnostic |
|---|---|---|---|
| Tap-persistence sequences | 100+ | 10s – 180s duration | DA: maximal; DAll: minimal |
| Recovery-window offerings | Variable | 5s – 30s rest | DA: skips; healthy: strategic use |
| Breath-gated challenges | 60+ | Simple → complex timing | Forces somatic integration |
| Self-prediction targets | Per-session | Based on prior performance | Over/under-prediction patterns |

## 5. Technical Requirements

**Input detection:** Touch/tap timing with ≤50ms precision. Hold-duration measurement. Optional accelerometer for intensity.  
**Fatigue modeling:** Performance-decline algorithm detects genuine fatigue vs. disengagement. Rolling baseline per player.  
**Breath detection:** Optional microphone-based breath tracking OR manual breath-button. Graceful degradation if unavailable.  
**Scoring outputs:** Persistence duration, recovery-utilization ratio, self-prediction accuracy, fatigue-override frequency. Feed module-spec §5.  
**Accessibility:** Alternative input modes for motor-impaired players. Effort-level calibrated to individual baseline, not absolute.
