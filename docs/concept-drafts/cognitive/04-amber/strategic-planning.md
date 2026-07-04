# Cognitive / Amber — Strategic-Planning Game Concept

> **Axis:** The strategic-planning axis probes cognitive intelligence through MULTI-STEP RULE-GOVERNED PLANNING — can the player plan a sequence of actions within a rule-system? At Amber, this is: "The code requires three steps in order. Plan them. Execute them. What comes first? What comes next? What comes last?"
>
> **Why this axis for Cognitive/Amber:** Concrete operational thinking includes SEQUENCING within rules — Tower-of-London-style planning at 3 disks, multi-step procedures, liturgical sequences. This modality tests whether the player can plan and execute ordered actions within a rule-governed system.

---

## 1. Game Identity

- **Title:** "The Liturgy's Order"
- **Core mechanic:** The player must PLAN and EXECUTE multi-step sequences within a rule-system. Not free planning but RULE-CONSTRAINED planning. "The liturgy requires: first the candle, then the bell, then the word. In that order. Plan your path to complete the rite."
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The First Rite → The Ordered Steps → The Constrained Path → The Changing Liturgy → The Master Planner

---

## 2. Catalyst Delivery

**What this modality uniquely presents:** Multi-step rule-constrained sequencing — the player must SEE the whole sequence and execute it in order, honouring constraints. The contact boundary is: "Can you plan multi-step actions within rules?"

**How it differs from the other 6:** Other modalities test classification, working memory, pattern recognition, or inhibition. This one tests PLANNING — the ability to hold a goal, sequence sub-steps, and execute them in order under constraints. It is the executive-function core of concrete operational thought.

**What it uniquely surfaces:** Whether the player can plan flexibly within rules — not rigidly perseverating, not impulsively skipping steps, not overreaching beyond capacity, not refusing novel sequences.

**Successful integration:** The player can plan multi-step actions within a rule-system — the executive foundation of concrete operational thought.

---

## 3. Game Design

### Setup
A ritual-planning space where the player must sequence actions to complete rites. Steps are shown; constraints are given; the player must plan the correct order and execute. Aesthetic: Amber-stage cathedral — ritual objects arranged on an altar, the player must arrange/execute them in the correct liturgical order.

### Interaction Phases
- **The First Rite (1-5):** 2-step sequence. "Candle, then bell. Plan. Execute." Minimal planning.
- **The Ordered Steps (5-15):** 3-step sequences with constraints. "Bell before word. Candle before bell. What order?"
- **The Constrained Path (15-30):** 3-step with multiple constraints. Tower-of-London-lite. "Cannot move X until Y is placed."
- **The Changing Liturgy (30-50):** Familiar rites with changed order. Must replan.
- **The Master Planner (50+):** Full integration: 3-step + constraints + adaptation + novel sequences.

### Feedback
- Correct sequence → "The rite is complete. The order was honoured. Well planned."
- Perseveration → "The rite changed. Look again. What's the new order?"
- Impulsive execution → "Wait. Plan first. What's step one? Step two? Step three? THEN execute."
- Overreaching → "Simpler. Three steps. Master these. The longer rite will come when you're ready."
- Refuses novelty → "Almost the same rite. One thing different. Your planning still works. Just adjust."

### Difficulty Adaptation
- Sequence length: 2-step → 3-step → 3-step with constraints
- Constraints: none → one → multiple (Tower-of-London style)
- Novelty: familiar sequences → slight variations → novel sequences
- Time: unlimited → time-awareness → competing demands
- Adaptation: fixed sequences → sequences that change between sessions

### Progression Table
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Rite | 1-5 | 2-step minimal planning |
| The Ordered Steps | 5-15 | 3-step constrained sequencing |
| The Constrained Path | 15-30 | Multiple constraints (ToL-lite) |
| The Changing Liturgy | 30-50 | Adaptive replanning |
| The Master Planner | 50+ | Full planning integration |

---

## 4. Item Pool

- **Simple sequences** (20+): 2-3 step rites with clear order
- **Constrained sequences** (20+): 3-step with ordering constraints
- **Tower-of-London items** (15+): Multi-constraint planning problems (3 disks)
- **Adaptive sequences** (10+): Familiar rites with changed elements
- **Novel sequences** (10+): Entirely new rites requiring fresh planning

---

## 5. Technical Requirements

- **Inputs:** Drag (arrange sequence); tap (execute steps in order); hold (confirm plan before execution)
- **Timing:** Planning time tracked (time between presentation and first action); execution time tracked; no time pressure but efficiency noted
- **NPC/AI:** Sequence generation system; constraint system (ordering rules, Tower-of-London mechanics); planning efficiency calculator (minimum moves); perseveration detection; adaptive difficulty (length, constraints, novelty)
- **LLM level:** None — fully deterministic. Sequence correctness and constraint adherence are binary/algorithmic.
- **State persistence:** Planning history; sequence accuracy; efficiency scores; constraint adherence; adaptation speed; novel-planning accuracy; checkpoint position; fatigue state
