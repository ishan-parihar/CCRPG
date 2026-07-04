# Cognitive / Red — Language-Reflective Game Concept

> **Axis:** The language-reflective axis probes cognitive capacity through verbal/written expression — articulating strategy, explaining reasoning, naming patterns. This modality accesses the METACOGNITIVE dimension of cognition: not just "can you do it" but "can you TALK about doing it."
>
> **Why this axis for Cognitive/Red:** At Red, language is concrete, declarative, and power-serving. "I did X because Y." The player can articulate 2-step reasoning but not abstract principles. Language here reveals whether cognitive capacity is genuinely integrated (can explain) or merely performed (can do but not articulate).

---

## 1. Game Identity

- **Title:** "The War-Tongue"
- **Core mechanic:** The player articulates battle strategies, explains tactical decisions, and names cognitive patterns through short verbal/text prompts — evaluated by LLM against a developmental rubric for concrete-operational egocentric reasoning.
- **Duration:** 3-6 minutes per session (infinite checkpoints)
- **Internal progression:** Naming → Explaining → Predicting → Teaching → Commanding

---

## 2. Catalyst Delivery

**Catalyst:** The game asks the player to PUT INTO WORDS their cognitive process. This is harder than doing — it requires metacognitive access to one's own thinking. At Red, the contact boundary is: "Can you name what you're doing and why?"

**Unconscious response:**
- *Submergent:* The player's relationship to self-knowledge surfaces. Can they access their own reasoning? Do they over-explain (dark-addiction)? Refuse to explain (dark-allergy)? Perform sophistication (golden-addiction)? Refuse depth (golden-allergy)?
- *Emergent:* The pull toward metacognitive capacity — can they tolerate the gap between doing and knowing-that-they-do?

**Integration path:** The game rewards genuine articulation (concrete, honest, specific) over performance (abstract, vague, impressive-sounding). The LLM rubric distinguishes between authentic Red-stage reasoning ("I hit the blue one because it was next") and performed higher-stage reasoning ("I employed a systematic approach to optimise outcomes").

**Successful integration:** The player can articulate their cognitive strategies in concrete, honest terms — neither over-intellectualising nor refusing reflection.

---

## 3. Game Design

### Setup
The player enters the War-Tongue chamber — a space where warriors articulate their battle knowledge. A "Tongue-Master" NPC (scarred veteran who speaks precisely) presents prompts. The aesthetic is Red-stage: weapon-inscribed walls, battle-maps, trophies of past victories.

### Interaction
- **Naming prompts:** "What did you just do?" → player types/speaks 1-3 words
- **Explanation prompts:** "Why did you choose that?" → player types/speaks 1-3 sentences
- **Prediction prompts:** "What will happen if...?" → player articulates expected outcome
- **Teaching prompts:** "Tell the recruit how to do this" → player explains to NPC
- **Command prompts:** "Order your squad" → player gives tactical instructions

### Feedback
- LLM evaluates against rubric: concrete? honest? proportional? Red-appropriate?
- Genuine concrete reasoning → Tongue-Master nods, progress advances
- Over-abstract performance → Tongue-Master: "Speak plainly, warrior. What did you ACTUALLY do?"
- Refusal/minimal → Tongue-Master: "Even the greatest warrior names their blade."
- The feedback is always in-character, never clinical

### Difficulty Adaptation
- Prompt complexity increases: naming → explaining → predicting → teaching → commanding
- Expected response sophistication increases (but always within concrete-operational bounds)
- LLM rubric adjusts: early checkpoints accept any genuine response; later checkpoints require specificity

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Naming | 1-5 | Single-word/phrase responses to "what did you do?" |
| Explaining | 5-15 | 1-3 sentence explanations of "why?" |
| Predicting | 15-30 | Articulating expected outcomes before acting |
| Teaching | 30-50 | Explaining to others (requires perspective-taking) |
| Commanding | 50+ | Tactical articulation under time pressure |

---

## 4. Item Pool

### Item types
- **Naming prompts:** Post-action reflection ("Name what you just did") — tied to deterministic task outcomes
- **Explanation prompts:** Causal reasoning ("Why did that work?") — tied to strategy choices
- **Prediction prompts:** Hypothetical reasoning ("What happens if you do X?") — tied to upcoming challenges
- **Teaching prompts:** Perspective-taking ("Explain to someone who doesn't know") — tied to mastered content
- **Command prompts:** Tactical articulation ("Tell your squad what to do") — tied to planning tasks

### Minimum pool size
- 30+ naming prompts (tied to different task types and outcomes)
- 30+ explanation prompts (tied to different strategy contexts)
- 20+ prediction prompts (tied to different challenge types)
- 20+ teaching prompts (tied to different skill levels)
- 20+ command prompts (tied to different tactical scenarios)

### Generation rules
- LLM generates prompts contextually based on what the player just did
- Prompts are always tied to ACTUAL gameplay (not abstract hypotheticals)
- Difficulty scales with: response length expected, specificity required, time pressure
- Shadow-probing prompts are interspersed naturally (not flagged as special)

### Drive/shadow mapping
- "How did YOU do it?" prompts → Agency probing
- "What do you think of their approach?" prompts → Communion probing
- "What are you good at?" prompts → Eros dark probing
- "What comes next?" prompts → Eros golden probing
- "Explain the basics" prompts → Agape probing
- Over-long responses → dark-addiction signal
- Minimal/refusal responses → dark-allergy signal
- Abstract/performative responses → golden-addiction signal
- Deflection from growth questions → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- Text input (typed responses, 1-50 words typical)
- Optional: voice input with speech-to-text (for accessibility and naturalness)
- Choice selection (for scaffolded prompts at early checkpoints)

### Timing requirements
- Response time tracked (but not pressured at early stages)
- Later stages introduce time pressure on command prompts
- No millisecond precision needed (unlike deterministic axis)

### NPC/AI requirements
- Tongue-Master NPC: LLM-driven dialogue, responds to player's actual words
- Training Partner NPC: provides comparison strategies for communion probing
- Recruit NPC: receives player's teaching, asks follow-up questions

### LLM requirements
- **High:** This modality is LLM-primary. Every response is evaluated by LLM against rubric.
- Prompt generation: contextual, tied to recent gameplay
- Response evaluation: developmental rubric scoring (concrete vs. abstract, authentic vs. performative)
- Dialogue generation: NPC responses adapted to player's language level
- Shadow detection: pattern recognition across sessions

### State persistence
- Response history (last 50 responses for pattern analysis)
- Language sophistication trajectory (is articulation improving?)
- Drive-health signals from language (running estimates)
- Shadow signals from language patterns (running estimates)
- Checkpoint position and phase
