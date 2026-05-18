# Somatic / Amber — Strategic-Planning

> **Axis:** The strategic-planning axis probes somatic intelligence through MULTI-STEP BODY-PLANNING — can the player plan a sequence of movements, anticipate body-demands, and execute a somatic strategy?
>
> **Why this axis:** Disciplined movement requires PLANNING — the kata has an order, the drill has phases, the body must be prepared for what comes next. This modality tests whether the player can think AHEAD about their body within a rule-governed movement system.

---

## §1 Game Identity

- **Title:** "The Drill-Master's Path"
- **Core mechanic:** The player must PLAN multi-step body-sequences — anticipate fatigue, sequence movements efficiently, prepare the body for upcoming demands. Not just executing form but STRATEGISING about form.
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The First Sequence → The Planned Drill → The Fatigue Map → The Changing Drill → The Master Strategist

---

## §2 Catalyst Delivery

**What it uniquely presents:** The demand to PLAN the body's path — sequencing, fatigue-anticipation, strategic ordering of movement.

**How it differs from other 6:** Only modality that tests somatic EXECUTIVE FUNCTION. Not "can your body do it?" (deterministic) or "can you feel it?" (embodied) but "can you PLAN it?" The cognitive-somatic bridge: thinking strategically about the body.

**What it uniquely surfaces:** Dark-addiction as rigid planning (same sequence regardless of body-state). Dark-allergy as no planning (impulsive execution). Golden-addiction as overcomplex plans that exceed capacity. Golden-allergy as planning only familiar sequences.

**Successful integration:** The player can plan multi-step body-sequences strategically — anticipating fatigue, sequencing wisely, adapting to changing demands.

---

## §3 Game Design

### Setup
A planning space where the player sequences body-movements strategically. Forms are available; the player must ORDER them wisely — considering fatigue, difficulty, body-state, and constraints. Aesthetic: Amber-stage war-room/dojo — the drill laid out, the body's path planned before execution.

### Interaction Phases
- **The First Sequence (1-5):** 2-form sequence. "Which first? The harder form while fresh, or the easier to warm up?"
- **The Planned Drill (5-15):** 3-4 form sequence with fatigue consideration. "Plan the order. Fatigue hits at form 3. Sequence wisely."
- **The Fatigue Map (15-30):** Plan around known body-limits. "Your hold weakens after 6 seconds. Plan the drill so holds come early."
- **The Changing Drill (30-50):** Plan must adapt mid-execution. "Fatigue hit earlier than expected. Replan the remaining forms."
- **The Master Strategist (50+):** Full integration: complex drill-planning with fatigue-mapping, adaptation, and novel forms.

### Feedback
- Wise plan → "Well sequenced. Hard forms while fresh. Rest before the hold. Strategic body."
- Rigid plan → "Same plan as yesterday. But today you're fatigued. The wise plan adapts to TODAY's body."
- No plan → "You jumped in without planning. Fatigue hit at form 2. Next time: think first, then move."
- Overcomplex → "Too many forms. Your body can't execute this plan. Simpler. Shorter. Executable."
- Frozen → "Same familiar drill. But your body is ready for more. Plan one new form into the sequence."

### Difficulty Adaptation
- Sequence length: 2-form → 3-form → 4-form → 4-form with constraints
- Fatigue complexity: predictable → variable → surprising
- Constraints: none → timing → social → multiple
- Adaptation demand: fixed plan → mid-execution replan
- Novelty: familiar forms only → mixed → novel forms included

### Progression Table
| Phase | Checkpoints | What changes |
|---|---|---|
| The First Sequence | 1-5 | 2-form basic sequencing |
| The Planned Drill | 5-15 | 3-4 form with fatigue awareness |
| The Fatigue Map | 15-30 | Planning around body-limits |
| The Changing Drill | 30-50 | Mid-execution replanning |
| The Master Strategist | 50+ | Full strategic somatic planning |

---

## §4 Item Pool

| Type | Pool size |
|---|---|
| Simple sequences (2-3 form ordering) | 20+ |
| Fatigue-aware sequences (account for body-limits) | 15+ |
| Constrained sequences (timing/social/resource constraints) | 15+ |
| Adaptive sequences (must change mid-execution) | 10+ |
| Novel-form sequences (incorporating unfamiliar movements) | 10+ |

---

## §5 Technical Requirements

- **Inputs:** Drag (sequence forms in order); tap (confirm plan); reorder (mid-execution replan)
- **Timing:** Planning time tracked; execution success measured; fatigue-point prediction accuracy
- **NPC/AI:** Form library (movements with difficulty/fatigue ratings); fatigue simulation (predictable body-limits); optimal-sequence calculator (scoring plan quality); adaptation triggers (mid-execution body-state changes); plan-execution tracker
- **LLM level:** Low — generates contextual planning scenarios; evaluates adaptive planning quality. Core sequencing assessment is algorithmic.
- **State persistence:** Planning history; sequencing quality scores; fatigue-anticipation accuracy; execution success rates; adaptation quality; novel-planning metrics; rigidity/impulsivity/overreach/frozen indicators; drive/shadow signals; checkpoint position
