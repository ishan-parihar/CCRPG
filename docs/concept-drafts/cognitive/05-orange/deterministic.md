# Cognitive / Orange — Deterministic Game Concept

> **Axis:** Pure psychometric measurement of formal-operational capacity through objective cognitive tasks.  **Why this axis for this module:** Orange cognition's defining feature is measurable — n-back accuracy, planning optimality, and flexibility metrics provide ground-truth calibration that all other modalities reference.

---

## 1. Game Identity

**Title:** The Proof Engine  
**Core Mechanic:** Sequences of classic cognitive tasks (n-back, Tower of London, WCST, dual-task, Stroop, complex span) presented as arcane machinery the player must operate — each "engine" tests a specific formal-operational sub-capacity.  
**Duration:** 4–8 minutes per session, infinite checkpoint.  
**Internal Progression:** Engine Apprentice → Engine Operator → Engine Master → Engine Architect (designs own challenge parameters).

## 2. Catalyst Delivery

**Unique Presentation:** Abstract geometric machinery — no narrative, no language, no social context. Pure pattern, pure logic, pure timing. The aesthetic is clean, mechanical, satisfying.  
**Differs from others:** No verbal reflection, no embodiment, no cooperation, no story. This is the cognitive line stripped to its measurable essence.  
**Uniquely Surfaces:** DAll (visible as accuracy collapse — the player who refuses formal operations cannot hide here) and DA (visible as perseveration — the player who over-analyses shows characteristic error patterns under time pressure).  
**Successful Integration:** Player can deploy formal operations efficiently without compulsion — fast, accurate, flexible, and willing to disengage when the session ends.

## 3. Game Design

**Setup:** Player enters the Engine Room — a space of interlocking geometric mechanisms. Each engine corresponds to a cognitive sub-capacity. The room adapts difficulty based on prior sessions.

**Interaction Phases:**
1. **Calibration** — 90-second warm-up at last-known difficulty, establishing baseline
2. **Ascent** — Staircase difficulty increase until 75% accuracy threshold
3. **Sustained** — Hold at threshold for 2 minutes, measuring stability
4. **Flexibility** — Unexpected rule-shifts mid-task (WCST-style), measuring adaptation cost
5. **Dual-Load** — Two engines simultaneously, measuring divided-attention capacity

**Feedback Examples:**
1. Correct n-back match: engine gear clicks into place, satisfying mechanical sound
2. Perseverative error: gear grinds, visual friction — not punitive, informative
3. Successful rule-shift: engine transforms smoothly, colour shift
4. Dual-task success: both engines synchronise, harmonic tone
5. Session complete: engine efficiency rating displayed as mechanical diagram

**Difficulty Adaptation:** 2-up/1-down staircase on n-back level; ToL disk count and minimum-move distance; WCST shift frequency; dual-task interference load; Stroop SOA compression.

**Internal Progression Table:**

| Level | n-back | ToL | WCST shifts | Dual-task | Stroop SOA |
|---|---|---|---|---|---|
| Apprentice | n=2→3 | 3-disk | Every 12 trials | None | 1000ms |
| Operator | n=3 stable | 4-disk | Every 8 trials | Simple | 800ms |
| Master | n=3 ceiling | 4-disk optimal | Every 5 trials | Complex | 600ms |
| Architect | n=3+ | 5-disk intro | Every 3 trials | Adaptive | 400ms |

## 4. Item Pool

**N-back Stimuli (30+):** Geometric shapes varying in colour, position, rotation, size — abstract, culture-free, no semantic content.  
**ToL Configurations (20+):** 4-disk arrangements with 4–7 minimum moves, systematically covering all difficulty tiers.  
**WCST Dimensions (15+):** Colour, shape, size, number, orientation, border, fill, position — shifts between any pair.  
**Dual-task Pairings (20+):** N-back + tracking, Stroop + arithmetic, ToL + tone-monitoring, span + visual search, flexibility + rhythm.  
**Complex Span Items (25+):** Processing tasks (arithmetic verification, symmetry judgement, reading) paired with storage items (letters, spatial positions, digits).

## 5. Technical Requirements

**Input Types:** Tap/click for match/non-match, drag for ToL disk moves, swipe for WCST sort, split-screen tap for dual-task.  
**Timing:** Frame-accurate RT measurement (±16ms); SOA control for Stroop; ISI control for n-back (2500ms default).  
**NPC/AI:** None — pure player-vs-task.  
**LLM:** None — fully deterministic scoring.  
**State Persistence:** Full trial-level data: RT, accuracy, perseveration count, dual-task cost ratio, staircase history, session-over-session trajectory. Feeds theta-estimation for all other modalities as ground-truth anchor.
