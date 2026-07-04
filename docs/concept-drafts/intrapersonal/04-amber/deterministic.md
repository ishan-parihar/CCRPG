# Intrapersonal / Amber — Deterministic Game Concept

> **Axis:** Objective role-identity measurement through behavioural consistency metrics.  **Why this axis for this module:** Role-identity is measurable as consistency — the self-as-role produces predictable, code-aligned action patterns that can be quantified without language, body, or social context.

---

## 1. Game Identity

- **Title:** The Oath-Keeper's Ledger
- **Core Mechanic:** Rapid role-consistency sorting — player is assigned a role with a code, then must sort incoming situations into "my duty" vs "not my duty" with increasing ambiguity and pressure.
- **Duration:** 3–7 minutes per session, infinite checkpoint.
- **Internal Progression:** Role-codes increase in complexity; pressure sources multiply; identity-stability is tested under fatigue, contradiction, and role-overlap.

---

## 2. Catalyst Delivery

- **Unique Presentation:** Abstract sigil-based interface — no characters, no narrative. Pure pattern-matching between role-code and situation-tokens.
- **Differs from others:** No verbal articulation, no embodiment, no social context. Measures raw cognitive role-alignment speed and accuracy.
- **Uniquely Surfaces:** DA (over-inclusion — claims everything as duty), DAll (under-inclusion — refuses duty-assignment), GAll (rigidity under novel situations), GA (too-fast adaptation suggesting no genuine role-hold).
- **Successful Integration:** Player sorts accurately, accepts ambiguous cases without distress, maintains identity-stability when role-code shifts mid-session.

---

## 3. Game Design

**Setup:** Player receives a role-code (e.g., "Guardian of the Eastern Gate: protect travellers, deny contraband, report anomalies"). Situation-tokens stream in.

**Interaction Phases:**
1. **Calibration** — clear-cut situations establish baseline role-comprehension
2. **Pressure** — speed increases, ambiguous tokens appear (is this contraband or medicine?)
3. **Contradiction** — two duties conflict (protect the traveller who carries contraband)
4. **Role-Shift** — mid-session role-code changes; player must update identity-alignment
5. **Integration** — mixed stream requiring flexible role-holding without collapse

**Feedback Examples:**
1. Accuracy heatmap showing over/under-inclusion patterns (DA/DAll signal)
2. Response-time curve revealing hesitation at role-boundaries (GAll signal)
3. Role-shift adaptation speed (GA signal — too-fast adaptation suggests no genuine role-hold)
4. Consistency score across contradictions (identity-stability metric)
5. Drift indicator showing whether sorting matches code or personal preference

**Difficulty Adaptation:** Token ambiguity increases with accuracy; role-code complexity scales with stage-mastery; pressure timing adapts to player's flow-channel.

**Internal Progression Table:**

| Level | Role-Code Complexity | Pressure | Shadow Probed |
|---|---|---|---|
| 1–3 | Single clear role | Low speed | Baseline |
| 4–6 | Role with exceptions | Medium speed + ambiguity | DA/DAll |
| 7–9 | Dual overlapping roles | High speed + contradiction | GAll |
| 10+ | Role-shift mid-stream | Maximum + novel codes | GA |

---

## 4. Item Pool

**Role-Codes (15):** Guardian, Healer, Scribe, Messenger, Judge, Warden, Keeper, Herald, Sentinel, Arbiter, Steward, Witness, Enforcer, Curator, Chaplain

**Situation-Tokens (30):** Traveller at gate, wounded stranger, forbidden text, child lost, fire in archive, superior's contradictory order, ally breaking code, unknown entity, resource shortage, ceremony disruption, oath-conflict, role-vacancy, code-amendment, emergency override, loyalty test, betrayal evidence, mercy plea, tradition violation, new member initiation, boundary dispute, sacred object misplaced, rival guild request, personal desire vs duty, exhaustion point, code-ambiguity, predecessor's error, collective punishment, whistleblower dilemma, succession crisis, code-obsolescence

**Pressure Modifiers (15):** Time compression, dual-stream, fog-of-war tokens, contradictory superior orders, emotional valence overlay, fatigue accumulation, peer-pressure indicators, reward temptation, punishment threat, role-loss threat, praise inflation, isolation, information asymmetry, false urgency, code-rewrite mid-task

**Role-Shift Triggers (15):** Promotion, demotion, lateral transfer, emergency reassignment, voluntary exchange, code-dissolution, merger, exile-return, apprentice-to-master, temporary substitution, dual-appointment, honorary title, stripped title, rotating duty, crisis role

**Scoring Dimensions (5):** Role-consistency accuracy, self-role alignment speed, identity-stability under pressure, role-shift adaptation, over/under-inclusion ratio

---

## 5. Technical Requirements

- **Input Types:** Tap/click binary sort (left/right), swipe for ambiguous-hold, long-press for "not enough information"
- **Timing:** 800ms–2500ms per token depending on difficulty; sub-200ms response tracking for pressure metrics
- **NPC/AI:** None — pure abstract system
- **LLM:** None — deterministic scoring only
- **State Persistence:** Role-code history, per-session accuracy curves, shadow-indicator trends, cross-session identity-stability trajectory, drive-health vector per session
