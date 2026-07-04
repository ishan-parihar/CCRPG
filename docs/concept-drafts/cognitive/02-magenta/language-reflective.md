# Cognitive / Magenta — Language-Reflective Game Concept

> **Axis:** The language-reflective axis probes cognitive intelligence through VERBAL and METACOGNITIVE engagement — can the player TALK ABOUT their symbolic experience? At Magenta, language is still emerging alongside symbols. The question is: can the player NAME what they see, DESCRIBE what a symbol means, and begin to REFLECT on their own symbolic process?
>
> **Why this axis for Cognitive/Magenta:** Language at Magenta is magical — words ARE things. "Naming" a rune gives power over it. This modality tests whether the player can articulate symbolic experience, which cross-validates against deterministic (if they talk advanced but can't hold n=1, that's golden-addiction).

---

## 1. Game Identity

- **Title:** "The Naming-Game"
- **Core mechanic:** The player names symbols, describes what they represent, explains how they work, and begins to reflect on their own symbol-use. Language as the bridge between symbol and understanding.
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The First Name → The Meaning → The Explanation → The Reflection → The Living Word

---

## 2. Catalyst Delivery

**Catalyst:** "What is this rune? What does it mean? How do you use it? How do you KNOW?" The contact boundary is: "Can you put your symbolic experience into words?"

**Unconscious response:**
- *Submergent:* How does the player relate to naming? The Magical Thinker believes naming IS controlling. The Concrete-Bound can't name symbols (they're "just shapes"). The Premature Reasoner over-explains with logic. The Wonder-Refuser won't name (naming makes it real and scary).
- *Emergent:* Can they name accurately? Can they describe without magical attribution? Can they begin to reflect?

**Integration path:** Rewards ACCURATE naming — the symbol is named for what it REPRESENTS, not for what power it supposedly has. Language serves understanding, not control.

**Successful integration:** The player names symbols accurately, describes their function, and shows early metacognitive awareness ("I held the rune in my mind and it came back").

---

## 3. Game Design

### Setup
The Naming-Game: a verbal-symbolic space where the player names, describes, and reflects on runes and symbols. The aesthetic: Magenta-stage naming-ritual — the first time words are given to the magical world. A cave wall where symbols appear and the player speaks their names.

### Interaction
- **The First Name (1-5):** A symbol appears. "What is this?" Player provides a name. Any name accepted initially.
- **The Meaning (5-15):** "What does it mean?" Player describes what the symbol represents. Accuracy matters.
- **The Explanation (15-30):** "How does it work?" Player explains the symbol's function. Must match actual use.
- **The Reflection (30-50):** "How did you remember it?" Player reflects on their own cognitive process.
- **The Living Word (50+):** Full verbal-symbolic integration — naming, meaning, explanation, reflection, all accurate.

### Feedback
- Accurate naming → "Yes. That's its name. You see it truly."
- Power-naming → "You named it to control it. But what IS it? Just describe."
- Refusal → "It's waiting for a name. Any name. What does it look like?"
- Over-explanation → "Simpler. What do you actually SEE? Not what you think you should see."

### Difficulty Adaptation
- Symbol complexity: simple → complex → abstract
- Naming demand: any name → accurate name → functional description → metacognitive reflection
- Verbal sophistication required: single word → phrase → sentence → paragraph
- Cross-validation pressure: naming must increasingly match deterministic performance

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Name | 1-5 | Any name accepted; engagement rewarded |
| The Meaning | 5-15 | Accuracy matters; name must match referent |
| The Explanation | 15-30 | Function must be described; how does it work? |
| The Reflection | 30-50 | Metacognitive: how do YOU use it? |
| The Living Word | 50+ | Full verbal-symbolic integration |

---

## 4. Item Pool

### Item types
- **Naming prompts:** Symbols requiring names (varied complexity)
- **Meaning prompts:** "What does X mean?" questions
- **Explanation prompts:** "How does X work?" questions
- **Reflection prompts:** "How did you...?" metacognitive questions
- **Cross-validation items:** Items that must match deterministic performance

### Minimum pool size
- 30+ naming, 25+ meaning, 20+ explanation, 15+ reflection, 15+ cross-validation

### Drive/shadow mapping
- Power-naming → dark-addiction; refusal to name → dark-allergy
- Over-sophisticated naming → golden-addiction; approach-withdrawal → golden-allergy

---

## 5. Technical Requirements

### Input types
- Voice input (primary at Magenta — language is spoken before written); text input (secondary); tap-to-select from options (scaffolded mode for younger players)

### Timing requirements
- No time pressure on verbal production; response latency tracked as secondary signal
- Cross-session tracking for naming consistency

### NPC/AI requirements
- Minimal. Symbols present themselves; the game asks questions.
- Optional: a "naming companion" who models naming behaviour

### LLM requirements
- **Very High:** Evaluates naming accuracy, descriptive quality, explanatory coherence, metacognitive depth. Detects power-naming vs. descriptive naming. Identifies sophistication-capacity gaps (golden-addiction signal).

### State persistence
- Naming history (all names given to all symbols); accuracy scores; descriptive quality ratings; metacognitive depth progression; cross-validation alignment with deterministic; power-naming frequency; refusal frequency; sophistication-capacity gap; drive/shadow signals; fatigue state; checkpoint position
