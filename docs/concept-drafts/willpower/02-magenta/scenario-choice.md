# Willpower / Magenta — Scenario-Choice Game Concept

> **Axis:** The scenario-choice axis probes willpower through WISH-INFORMED DECISIONS — can the player choose based on their wish? At Magenta, this is: "You wished for X. Now two paths. Which one leads toward your wish?" The wish must guide choice.
>
> **Why this axis for Willpower/Magenta:** Choosing in service of a wish is the bridge between wishing and doing. The player must HOLD the wish AND use it to guide a decision. This is harder than just holding — it requires the wish to be functional, not just decorative.

---

## 1. Game Identity

- **Title:** "The Wish-Path"
- **Core mechanic:** The player declares a wish, then faces choices where one option aligns with the wish and others don't. Can they choose in service of their wish? Can the wish guide action? The proto-implementation-intention.
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Simple Choice → The Tempting Detour → The Wish-Conflict → The Delayed Path → The Guided Will

---

## 2. Catalyst Delivery

**Catalyst:** "You wished for X. Now choose. This path leads toward your wish. That path leads somewhere else (but it's shiny). Which do you take?" The contact boundary is: "Can your wish guide your choices?"

**Unconscious response:**
- *Submergent:* How does the wish relate to choice? The Magical Demander demands both paths. The Wish-Abandoner forgets the wish and chooses randomly. The Premature Disciplinarian chooses the "correct" path without consulting the wish. The Effort-Refuser won't choose at all.
- *Emergent:* Can they hold the wish AND use it to choose? Can the wish function as a guide?

**Integration path:** Rewards WISH-GUIDED CHOICE — choosing based on the declared wish. Not demanding both, not forgetting the wish, not choosing "correctly" without desire, not refusing to choose.

**Successful integration:** The player holds a wish and uses it to guide choices — the wish becomes functional, not just decorative.

---

## 3. Game Design

### Setup
The Wish-Path: a choice-space where the player's wish guides decisions. The aesthetic: Magenta-stage crossroads — paths that glow with the colour of the player's wish. The wish-aligned path resonates; the distractor sparkles differently.

### Interaction
- **The Simple Choice (1-5):** Wish declared → two paths → one clearly wish-aligned. Choose.
- **The Tempting Detour (5-15):** Wish-aligned path is less immediately attractive. Distractor is shiny.
- **The Wish-Conflict (15-30):** Two wishes compete. Which one guides the choice?
- **The Delayed Path (30-50):** Wish-aligned path requires waiting. Distractor is immediate.
- **The Guided Will (50+):** Full wish-guided choosing: declare → hold → choose → persist.

### Feedback
- Wish-guided choice → "Your wish led you. You followed. The path opens."
- Demands both → "One path. Your wish chooses. Not both. Which one?"
- Forgot wish → "Remember your wish? It's still here. [shows wish]. Now choose."
- Duty-choice → "Not the 'right' one. The one your WISH wants. What did you wish for?"
- Refuses to choose → "Just lean. Tiny lean. Which way does your wish pull? That's enough."

### Difficulty Adaptation
- Distractor attractiveness: low → moderate → high
- Wish-path clarity: obvious → moderate → subtle
- Delay before wish-path reward: none → brief → moderate
- Choice complexity: binary → ternary → competing wishes
- Social pressure: none → companion chooses differently

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Simple Choice | 1-5 | Clear wish-aligned path; easy choice |
| The Tempting Detour | 5-15 | Attractive distractor; wish-alignment tested |
| The Wish-Conflict | 15-30 | Competing wishes; priority tested |
| The Delayed Path | 30-50 | Wish-path requires waiting |
| The Guided Will | 50+ | Full wish-guided choosing integration |

---

## 4. Item Pool

### Item types
- **Simple choices:** Clear wish-aligned vs. non-aligned paths
- **Temptation items:** Attractive distractors competing with wish-path
- **Conflict items:** Two valid wishes competing for choice-guidance
- **Delay items:** Wish-path requires waiting; distractor is immediate
- **Social items:** Companion chooses differently; tests wish-stability

### Minimum pool size
- 25+ simple, 20+ temptation, 15+ conflict, 15+ delay, 10+ social

### Drive/shadow mapping
- Demands both/chooses distractor → dark-addiction; forgets wish → dark-allergy
- Duty-choice without wish → golden-addiction; refuses to choose → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (path choice); wish-declaration (verbal or tap); hold (wish-recall)

### Timing requirements
- Choice latency tracked; wish-recall timing; no punishing time pressure but latency informative

### NPC/AI requirements
- Path visualization (wish-aligned vs. distractor)
- Distractor system (attractive alternatives)
- Wish-reminder system (shows wish at choice-point when needed)
- Optional: companion who models wish-guided choosing

### LLM requirements
- **High:** Scenario generation, wish-reference evaluation, desire-vs-duty analysis. Core choice-accuracy algorithmic.

### State persistence
- Wish-choice alignment rates; wish-recall accuracy; distractor resistance; choice latencies; wish-reference quality; demand-both indicators; wish-forgetting indicators; duty-choice indicators; choice-avoidance indicators; drive/shadow signals; fatigue state; checkpoint position
