# Willpower / Magenta — Language-Reflective Game Concept

> **Axis:** The language-reflective axis probes willpower through VERBAL ARTICULATION of wishes and intentions — can the player NAME what they want? At Magenta, this is the first "I want..." statement: putting desire into words. The wish becomes speakable.
>
> **Why this axis for Willpower/Magenta:** Naming a wish is the first step toward holding it. At Magenta, the wish that can be SPOKEN is more stable than the wish that remains felt-only. This modality tests whether the player can articulate desire — the verbal seed of intention.

---

## 1. Game Identity

- **Title:** "The Wish-Speaker"
- **Core mechanic:** The player articulates wishes verbally — naming what they want, describing their desire, speaking their intention aloud. The LLM evaluates the QUALITY of wish-articulation: clarity, stability, genuine desire vs. performance.
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The First "I Want" → The Wish-Name → The Wish-Story → The Wish-Keeper → The Speaking Will

---

## 2. Catalyst Delivery

**Catalyst:** "What do you want? Say it. Name your wish. Tell me what you're wishing for." The contact boundary is: "Can you put your wish into words?"

**Unconscious response:**
- *Submergent:* How does the player articulate desire? The Magical Demander speaks demands ("GIVE ME!"). The Wish-Abandoner can't name anything ("I don't know"). The Premature Disciplinarian speaks tasks ("I need to DO X"). The Effort-Refuser speaks beautiful wishes but adds "but I can't."
- *Emergent:* Can they name a genuine wish? Can they hold it in words? Can they speak it stably?

**Integration path:** Rewards GENUINE WISH-ARTICULATION — clear, stable, desire-grounded speech. Not demanding, not empty, not task-focused, not defeated.

**Successful integration:** The player names a wish clearly, holds it in words, and speaks it with genuine desire — the verbal seed of intention.

---

## 3. Game Design

### Setup
The Wish-Speaker: a verbal wish-articulation space where the player names their desires. The aesthetic: Magenta-stage wishing-tree — spoken wishes become glowing leaves. Clear wishes glow bright. Demands crackle. Empty speech produces nothing. Negated wishes dim.

### Interaction
- **The First "I Want" (1-5):** Name one wish. Any wish. "I want..."
- **The Wish-Name (5-15):** Name the wish more specifically. What exactly? Clarity.
- **The Wish-Story (15-30):** Tell the story of the wish. Why do you want it? What would it feel like?
- **The Wish-Keeper (30-50):** Return to the wish after distraction. Can you name it again? Same wish?
- **The Speaking Will (50+):** Full wish-articulation: name → clarify → story → hold → return.

### Feedback
- Clear wish-articulation → "Your wish glows on the tree. Beautiful. You named it."
- Demand-language → "That's a demand, not a wish. Softer. 'I wish for...' Try again."
- Empty/no wish → "Something calls to you. Listen. Even something tiny. Name it."
- Task-language → "That's a task. What's the WISH underneath? What do you WANT?"
- Negated wish → "You said it! Then you took it back. Say it again. No 'but.' Just the wish."

### Difficulty Adaptation
- Wish specificity: vague → specific → detailed
- Wish stability: single naming → return after distraction → hold across session
- Wish depth: surface desire → underlying want → core wish
- Social context: solo → companion present → shared naming

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First "I Want" | 1-5 | Any wish-articulation at all |
| The Wish-Name | 5-15 | Specific, clear wish-naming |
| The Wish-Story | 15-30 | Wish elaboration; why and what-it-feels-like |
| The Wish-Keeper | 30-50 | Wish-recall after distraction |
| The Speaking Will | 50+ | Full verbal wish-holding integration |

---

## 4. Item Pool

### Item types
- **Wish-prompts:** Contexts that invite wish-articulation
- **Clarity challenges:** Prompts for specificity ("What exactly?")
- **Story prompts:** "Why do you want it?" "What would it feel like?"
- **Distraction intervals:** Breaks between wish-naming and wish-recall
- **Social contexts:** Companion wishes that test own-wish stability

### Minimum pool size
- 25+ prompts, 20+ clarity challenges, 15+ story prompts, 15+ distractions, 10+ social contexts

### Drive/shadow mapping
- Demand-language → dark-addiction; empty/no-wish → dark-allergy
- Task-language → golden-addiction; wish+negation → golden-allergy

---

## 5. Technical Requirements

### Input types
- Voice input (primary) or text input; tap-to-select for wish-choice prompts

### Timing requirements
- Response latency tracked; wish-recall timing; no time pressure on articulation

### NPC/AI requirements
- Wish-tree visualization (spoken wishes become visible)
- Companion who models wish-articulation
- Prompt system that adapts to player's verbal capacity

### LLM requirements
- **Very High:** Evaluates all verbal output. Discriminates demand/wish/task/negation. Assesses genuineness, clarity, stability, elaboration. Generates adaptive prompts. Core modality for language-reflective axis.

### State persistence
- Wish-formation history; wish-clarity scores; genuineness ratings; stability/recall accuracy; elaboration quality; demand-language frequency; empty-response frequency; task-language frequency; negation frequency; drive/shadow signals; verbal capacity baseline; fatigue state; checkpoint position
