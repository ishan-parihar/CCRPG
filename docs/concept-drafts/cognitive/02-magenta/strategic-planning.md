# Cognitive / Magenta — Strategic-Planning Game Concept

> **Axis:** The strategic-planning axis probes cognitive intelligence through MULTI-STEP SEQUENCING — can the player plan ahead? At Magenta, planning is MINIMAL: the player can hold ONE step in mind and execute it. True multi-step planning (n>1) is Red+. But PROTO-PLANNING exists: "I do THIS, then THAT happens."
>
> **Why this axis for Cognitive/Magenta:** Even at n=1, the seed of planning exists: "If I put the fire-rune here, the door opens." This is single-step causal reasoning — the foundation of all later planning. This modality tests whether the player can hold a single cause-effect link and ACT on it.

---

## 1. Game Identity

- **Title:** "The Spell-Planner"
- **Core mechanic:** The player plans single-step symbolic actions — "place this rune HERE to make THAT happen." Proto-planning: one cause → one effect, held in mind before execution. The seed of Tower-of-London at its most primitive.
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Single Step → The Cause-Effect → The Delayed Action → The Two-Path → The First Plan

---

## 2. Catalyst Delivery

**Catalyst:** "If you place the fire-rune on the altar, the door opens. Can you hold that in mind and DO it?" The contact boundary is: "Can you hold a cause-effect link and act on it?"

**Unconscious response:**
- *Submergent:* Can the player hold cause→effect? The Magical Thinker believes ANY action causes ANY effect (magical causation). The Concrete-Bound acts without planning (just does things). The Premature Reasoner tries to plan 3 steps when 1 is the ceiling. The Wonder-Refuser won't plan (planning commits to the symbolic world).
- *Emergent:* Can they hold the link stably? Can they delay action until the right moment?

**Integration path:** Rewards ACCURATE single-step planning — hold the cause-effect link, wait for the right moment, execute. Not magical causation, not random action, not over-planning.

**Successful integration:** The player holds a single cause-effect link in mind, waits for the appropriate moment, and executes the planned action accurately.

---

## 3. Game Design

### Setup
The Spell-Planner: a cause-effect space where single symbolic actions produce outcomes. The player must hold the cause-effect link in mind and execute at the right moment. The aesthetic: Magenta-stage ritual-ground — altars that respond to runes, doors that open to symbols, a world where one action produces one result.

### Interaction
- **The Single Step (1-5):** "Place fire-rune on altar → door opens." Immediate cause-effect. Execute now.
- **The Cause-Effect (5-15):** Must HOLD the link before executing. Delay between learning and action.
- **The Delayed Action (15-30):** Must wait for the RIGHT MOMENT to execute (timing + planning).
- **The Two-Path (30-50):** Two possible cause-effect links; choose the correct one for desired outcome.
- **The First Plan (50+):** Full single-step planning mastery — hold, wait, choose, execute accurately.

### Feedback
- Accurate planned action → "You knew what would happen. You planned. It worked."
- Magical wishing → "You hoped it would work. But did you KNOW? Which rune opens which door?"
- Random action → "You just tried. Next time — think first. What will happen?"
- Over-planning → "One step. Just one. What's the ONE thing to do right now?"
- Avoidance → "It's safe to try. What do you think will happen? Just guess."

### Difficulty Adaptation
- Cause-effect transparency: obvious → learned → inferred
- Delay between learning and execution: 0s → 2s → 5s → 10s
- Number of possible actions: 1 → 2 → 3
- Timing precision: generous → moderate → precise

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Single Step | 1-5 | Immediate cause-effect; no delay |
| The Cause-Effect | 5-15 | Delay between learning and execution |
| The Delayed Action | 15-30 | Timing matters; wait for right moment |
| The Two-Path | 30-50 | Choose between cause-effect links |
| The First Plan | 50+ | Full single-step planning mastery |

---

## 4. Item Pool

### Item types
- **Immediate cause-effect:** Place rune → outcome (no delay)
- **Delayed cause-effect:** Learn link → wait → execute
- **Timed cause-effect:** Execute at specific moment
- **Choice cause-effect:** Multiple links; choose correct one
- **Transfer items:** Cause-effect links from other contexts

### Minimum pool size
- 25+ immediate, 20+ delayed, 15+ timed, 15+ choice, 10+ transfer

### Drive/shadow mapping
- Magical causation → dark-addiction; random action → dark-allergy
- Multi-step attempts → golden-addiction; plan-avoidance → golden-allergy

---

## 5. Technical Requirements

### Input types
- Drag-and-drop (place rune on target); tap-to-execute (timed action); tap-to-select (choose between options)

### Timing requirements
- Execution timing at ±100ms precision; delay measurement continuous; plan-holding duration tracked

### NPC/AI requirements
- Environmental cause-effect system (altars, doors, creatures that respond to runes)
- Timing system (moments when action is effective)
- Optional: ally who demonstrates cause-effect links (communion probing)

### LLM requirements
- **Low-Medium:** Scenario generation, cause-effect narration. Core scoring algorithmic.

### State persistence
- Cause-effect accuracy history; plan-holding durations; timing accuracy; choice accuracy; plan-before-action rates; magical-causation indicators; random-action indicators; multi-step attempt indicators; avoidance indicators; drive/shadow signals; fatigue state; checkpoint position
