# Interpersonal / Red — Language-Reflective Game Concept

> **Axis:** The language-reflective axis probes interpersonal intelligence through VERBAL and METACOGNITIVE channels — can the player articulate what others want? Can they explain WHY someone behaves as they do? Can they predict others' actions through verbal reasoning? Can they reflect on their OWN interpersonal patterns?
>
> **Why this axis for Interpersonal/Red:** At Red, verbal interpersonal reasoning is CONCRETE and EGOCENTRIC: "He wants my stuff because he's greedy." "She helps me because I'm strong." The language-reflective axis tests whether the player can THINK ABOUT others' minds verbally — and cross-validates against deterministic (if verbal sophistication >> reading accuracy, golden-addiction is active).

---

## 1. Game Identity

- **Title:** "The War-Tongue"
- **Core mechanic:** The player verbally models others' minds — naming intentions, explaining behaviours, predicting actions, and reflecting on their own interpersonal patterns. LLM evaluates the quality of verbal interpersonal reasoning.
- **Duration:** 3-6 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Naming Intent → Explaining Behaviour → Predicting Action → Teaching Others → Reflecting on Self

---

## 2. Catalyst Delivery

**Catalyst:** "Tell me what they want. Tell me WHY. Tell me what they'll do NEXT." The game asks the player to VERBALISE their interpersonal intelligence — making implicit social cognition explicit.

**Unconscious response:**
- *Submergent:* The player's verbal model of others reveals their interpersonal structure. Do they see others as threats (dark-allergy)? As objects to control (dark-addiction)? As complex beings they can't simply read (golden-addiction)? As irrelevant (golden-allergy)?
- *Emergent:* Can they articulate more nuanced models? Predict more accurately? Reflect on their own patterns?

**Integration path:** Rewards ACCURATE verbal modelling that matches behavioural reality. Sophistication without accuracy = golden-addiction. Accuracy without reflection = incomplete integration.

**Successful integration:** The player verbally models others' intentions accurately, explains behaviour in concrete causal terms, predicts actions correctly, and can reflect on their own interpersonal patterns.

---

## 3. Game Design

### Setup
The War-Tongue: a council fire where the player speaks about others. NPCs arrive, behave, and the player must VERBALISE their reading. The aesthetic: Red-stage war-council, the warlord's advisors speaking of allies and enemies, firelit deliberation.

### Interaction
- **Naming Intent:** NPC behaves; player types/selects what they want. (1-5)
- **Explaining Behaviour:** "WHY do they want that?" Player provides causal reasoning. (5-15)
- **Predicting Action:** "What will they do NEXT?" Player predicts from verbal model. (15-30)
- **Teaching Others:** Player explains an NPC's intent to a third NPC (scaffolding another's reading). (30-50)
- **Reflecting on Self:** "What do YOU do when someone wants to help you?" Player reflects on own patterns. (50+)

### Feedback
- Accurate naming → "Your tongue speaks true. You see their heart."
- Inaccurate → "Your words miss the mark. Watch them again — what do their actions say?"
- Over-elaborate → "Too many words. The warrior's tongue is sharp. One truth. Speak it."
- Self-reflective → "You see yourself among others. That is the war-chief's wisdom."

### Difficulty Adaptation
- Intent complexity: obvious → moderate → ambiguous → shifting
- Verbal demand: naming → explaining → predicting → teaching → reflecting
- NPC count: 1 → 2 → 3 (simultaneous verbal modelling)

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Naming Intent | 1-5 | Single NPC, obvious intent, one-word response |
| Explaining Behaviour | 5-15 | Causal reasoning required; "why?" |
| Predicting Action | 15-30 | Future-oriented verbal modelling |
| Teaching Others | 30-50 | Scaffolding another's interpersonal reading |
| Reflecting on Self | 50+ | Metacognitive awareness of own patterns |

---

## 4. Item Pool Specification

### Item types
- **NPC scenarios for naming:** Behavioural vignettes requiring intent identification
- **Causal prompts:** "Why does X want Y?" requiring concrete reasoning
- **Prediction scenarios:** "What will X do next?" requiring verbal forecasting
- **Teaching scenarios:** Explain an NPC's intent to a naive third party
- **Self-reflection prompts:** "What do you do when...?" metacognitive questions

### Minimum pool size
- 30+ naming scenarios; 25+ causal prompts; 20+ prediction scenarios; 15+ teaching scenarios; 15+ self-reflection prompts

### Drive/shadow mapping
- All-about-control language → dark-addiction; minimal/threat language → dark-allergy
- Over-elaborate language → golden-addiction; no relational vocabulary → golden-allergy

---

## 5. Technical Requirements

### Input types
- Free-text input (primary); multiple-choice for scaffolded phases; voice input (optional)

### Timing requirements
- No time pressure on verbal responses (quality over speed)
- Response latency tracked as secondary signal (very fast = possibly scripted; very slow = possibly struggling)

### NPC/AI requirements
- NPCs with defined intents that the LLM can verify against
- Ground-truth intent must be algorithmically defined (not LLM-generated) for scoring accuracy

### LLM requirements
- **Very High:** Evaluates free-text responses against rubrics; assesses sophistication level; detects shadow signals in language patterns; generates contextual feedback

### State persistence
- Verbal accuracy history; sophistication level; causal reasoning quality; prediction accuracy; self-reflection depth; language patterns (control-language, threat-language, over-elaborate, relational-avoidant); drive/shadow signals; cross-validation ratio vs. deterministic; fatigue state; checkpoint position
