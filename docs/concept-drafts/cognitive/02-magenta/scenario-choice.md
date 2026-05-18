# Cognitive / Magenta — Scenario-Choice Game Concept

> **Axis:** The scenario-choice axis probes cognitive intelligence through DECISIONS — can the player use symbolic thinking to make choices? At Magenta, choices are magical: "If I pick the fire-rune, the door opens. If I pick the water-rune, the river calms." The question is whether the player can use symbols to REASON about outcomes (pre-operational reasoning).
>
> **Why this axis for Cognitive/Magenta:** Symbolic thinking becomes USEFUL when it guides choice. At Magenta, choices are simple (one symbol → one outcome) but the player must hold the symbol-outcome link in mind. This is the bridge between symbol-holding (deterministic) and symbol-application (real-world use).

---

## 1. Game Identity

- **Title:** "The Rune-Chooser"
- **Core mechanic:** The player faces simple symbolic dilemmas — choose a rune, and the world responds. Each choice requires holding a symbol-meaning link in mind and selecting based on desired outcome. Pre-operational reasoning through magical choice.
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Simple Choice → The Linked Choice → The Costly Choice → The Uncertain Choice → The Wise Choice

---

## 2. Catalyst Delivery

**Catalyst:** "Two runes. One opens the door. One wakes the beast. Which do you choose?" The contact boundary is: "Can you use symbols to guide your choices?"

**Unconscious response:**
- *Submergent:* How does the player choose? The Magical Thinker chooses by "feeling the power" (not by symbol-meaning). The Concrete-Bound chooses randomly (symbols don't mean anything). The Premature Reasoner over-analyses simple choices. The Wonder-Refuser won't choose (choosing commits to the symbolic world).
- *Emergent:* Can they hold symbol-meaning links and choose accordingly? Can they handle uncertainty?

**Integration path:** Rewards SYMBOL-GUIDED choice — choosing based on what the symbol MEANS, not magical feeling, random selection, or over-analysis. Simple, accurate, symbol-informed decisions.

**Successful integration:** The player holds symbol-meaning links, chooses based on desired outcomes, and accepts the consequences of symbolic choices.

---

## 3. Game Design

### Setup
The Rune-Chooser: a magical choice-space where symbols lead to outcomes. The player faces rune-dilemmas and must choose based on symbol-meaning. The aesthetic: Magenta-stage crossroads — two paths marked by runes, each leading somewhere different. The world responds to the choice.

### Interaction
- **The Simple Choice (1-5):** One rune = one outcome. "Fire-rune opens the fire-door." Binary, clear.
- **The Linked Choice (5-15):** Symbol-meaning must be REMEMBERED from earlier. "You learned fire-rune means open. Now choose."
- **The Costly Choice (15-30):** Both options have value; one must be sacrificed. Simple trade-offs.
- **The Uncertain Choice (30-50):** Partial information; must infer from symbol-properties.
- **The Wise Choice (50+):** Full symbolic choice-making — hold meaning, weigh options, choose with understanding.

### Feedback
- Correct symbol-guided choice → "You read the rune truly. The door opens."
- Magical-feeling choice (correct by luck) → "It worked, but did you know WHY? What did the rune mean?"
- Random choice → "You guessed. Next time, look at the rune. It tells you."
- Over-analysis → "Simpler. What does the rune mean? That's your answer."
- Refusal → "The runes wait. Whenever you're ready. No rush."

### Difficulty Adaptation
- Number of options: 2 → 3 → 4
- Symbol-meaning transparency: obvious (looks like referent) → learned → abstract
- Consequence weight: trivial → moderate → significant
- Information completeness: full → partial → minimal

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Simple Choice | 1-5 | Binary; symbol-meaning obvious |
| The Linked Choice | 5-15 | Must remember learned meanings |
| The Costly Choice | 15-30 | Trade-offs; both options have value |
| The Uncertain Choice | 30-50 | Partial information; inference needed |
| The Wise Choice | 50+ | Full symbolic choice-making |

---

## 4. Item Pool Specification

### Item types
- **Binary choices:** Two runes, clear outcomes
- **Memory-linked choices:** Outcomes depend on previously learned meanings
- **Trade-off choices:** Both options valuable; sacrifice required
- **Inference choices:** Partial information; must reason from symbol-properties
- **Consequence chains:** Choice leads to further choices (simple branching)

### Minimum pool size
- 30+ binary, 25+ memory-linked, 20+ trade-off, 15+ inference, 10+ chains

### Drive/shadow mapping
- Magical-feeling choices → dark-addiction; random/position choices → dark-allergy
- Over-analysis → golden-addiction; choice-avoidance → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (choose rune); drag-to-place (place rune on target); hold-to-confirm (deliberate choice)

### Timing requirements
- Decision time tracked (diagnostic, not punishing); no time pressure at early phases
- Cross-session tracking for symbol-meaning retention

### NPC/AI requirements
- Scenario environments that respond to choices (doors open, paths clear, creatures respond)
- Optional: ally who suggests choices (communion probing)

### LLM requirements
- **High:** Scenario generation, outcome narration, trade-off construction, inference-item generation. Binary accuracy scoring algorithmic.

### State persistence
- Choice history; accuracy per choice-type; decision times; symbol-meaning retention scores; trade-off quality; inference quality; magical-feeling indicators; random-choice indicators; over-analysis indicators; avoidance indicators; drive/shadow signals; fatigue state; checkpoint position
