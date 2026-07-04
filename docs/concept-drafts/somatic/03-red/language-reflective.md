# Somatic / Red — Language-Reflective Game Concept

> **Axis:** The language-reflective axis probes somatic capacity through VERBAL ARTICULATION — can the player name, describe, explain, and reflect on their body's experience? This modality accesses the METACOGNITIVE dimension of body intelligence: not "can your body do it" but "can you TALK about what your body does and feels?"
>
> **Why this axis for Somatic/Red:** At Red, the body is powerful but inarticulate. The player CAN react, hold, and rhythm — but can they NAME what they feel? Can they describe the difference between tension and relaxation? Between fast and rushed? Between power and force? This axis tests whether somatic intelligence has reached the level of conscious access — or whether it remains purely implicit.

---

## 1. Game Identity

- **Title:** "The Body's Voice"
- **Core mechanic:** The player is prompted to articulate body-states, movement qualities, and physical experiences through verbal/text responses — naming sensations, explaining physical strategies, predicting body-responses, and teaching movement to NPCs through language.
- **Duration:** 3-7 minutes per session (infinite checkpoints)
- **Internal progression:** Naming → Describing → Explaining → Predicting → Teaching

---

## 2. Catalyst Delivery

**Catalyst:** The game asks the player to PUT WORDS to their body's experience. The contact boundary is: "Can you make your body's knowledge CONSCIOUS through language?" At Red, this is concrete and power-framed: "Name what your body does when it strikes."

**Unconscious response:**
- *Submergent:* The player's relationship to body-awareness surfaces. Do they over-describe (dark-addiction — hyper-aware of every sensation)? Go blank (dark-allergy — no access to body-experience)? Use technical language without felt-sense (golden-addiction)? Refuse to articulate (golden-allergy)?
- *Emergent:* The pull toward conscious embodiment — can they bring body-knowledge into language without losing the body-knowledge?

**Integration path:** The game rewards AUTHENTIC body-language — words that match demonstrated physical capacity. A player who says "I feel powerful" while demonstrating power scores higher than one who uses sophisticated body-language without physical backing. Language must MATCH the body.

**Successful integration:** The player can name basic body-states accurately (tense/relaxed, fast/slow, strong/weak), describe their physical strategies in concrete terms, and predict their body's response to challenges — all without losing the body-experience in the process of articulating it.

---

## 3. Game Design

### Setup
The player sits with the Body-Speaker — an NPC who is both warrior and sage. The setting is a quiet corner of the Red-stage training ground: after physical training, the warrior reflects. Firelight, cooling sweat, the body still humming from effort. The Body-Speaker asks questions about the body's experience.

### Interaction
- **Naming:** "What is your body doing right now? Name it in one word." (Single-word body-state identification)
- **Describing:** "Tell me about your last strike. What did your body feel?" (Multi-sentence body-experience description)
- **Explaining:** "Why did your body react that way? What made it fast/slow/strong/weak?" (Causal reasoning about body-behaviour)
- **Predicting:** "If I throw a faster strike next time, what will your body do?" (Anticipatory body-modelling)
- **Teaching:** "The recruit doesn't know how to hold a stance. Explain it using only body-feelings, not instructions." (Somatic knowledge transfer through language)

### Feedback
- Authentic body-language → Body-Speaker nods: "You know your body, warrior"
- Generic/empty language → Body-Speaker probes: "That's a word. But what do you FEEL?"
- Technical/borrowed language → Body-Speaker challenges: "Those are someone else's words. What are YOURS?"
- Accurate self-assessment (matches demonstrated capacity) → "Your tongue matches your blade. Good."
- Inaccurate self-assessment → "Your words say one thing. Your body showed another. Which is true?"

### Difficulty Adaptation
- Prompt complexity: single-word → sentence → paragraph → dialogue
- Body-state complexity: gross (tense/relaxed) → specific (which muscles, what quality) → dynamic (how it changes)
- Temporal scope: present moment → recent past → prediction → teaching
- Abstraction level: concrete sensation → movement quality → body-strategy → body-wisdom

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Naming | 1-5 | Single-word body-state identification; binary choices; present-moment only |
| Describing | 5-15 | Multi-word descriptions; recent physical experience; quality language |
| Explaining | 15-25 | Causal reasoning about body-behaviour; why questions; strategy articulation |
| Predicting | 25-40 | Anticipatory body-modelling; "what will happen if..." |
| Teaching | 40+ | Transferring body-knowledge through language; scaffolding others' somatic awareness |

---

## 4. Item Pool

### Item types
- **Body-state prompts:** "What does X feel like right now?" (varied body-parts, states, contexts)
- **Experience-recall prompts:** "Describe what your body did when..." (linked to recent gameplay)
- **Causal prompts:** "Why did your body..." (linked to demonstrated behaviour)
- **Prediction prompts:** "What will your body do if..." (linked to upcoming challenges)
- **Teaching prompts:** "Explain to the recruit how to..." (linked to mastered physical skills)

### Minimum pool size
- 40+ body-state prompts (body-part × state × context combinations)
- 30+ experience-recall prompts (linked to actual gameplay events)
- 20+ causal prompts (linked to demonstrated patterns)
- 15+ prediction prompts (linked to upcoming difficulty)
- 10+ teaching prompts (linked to mastered skills)

### Generation rules
- LLM generates prompts contextualised to player's ACTUAL recent physical performance
- Prompts reference REAL gameplay events (not hypothetical): "In that last drill, your reaction was 280ms. What did that feel like?"
- Difficulty scales with prompt complexity and required abstraction level
- All prompts must be answerable from BODY experience (not cognitive analysis)
- Red-stage language: concrete, power-framed, warrior-contextualised

### Drive/shadow mapping
- Ownership and specificity in body-descriptions → Agency probing
- Self-reference in shared-experience descriptions → Communion probing
- Accuracy of self-assessment language → Eros probing
- Quality of simple body-state descriptions → Agape probing
- Movement language in rest-prompts → dark-addiction signal
- Empty/minimal body-language → dark-allergy signal
- Technical language without felt-sense → golden-addiction signal
- Resistance to structured body-vocabulary → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- Text input (primary — typed body-descriptions)
- Voice input (optional — spoken body-descriptions; may be more authentic)
- Multiple-choice (fallback for early stages — select the word that matches)
- Rating scales (for structured body-state assessment)

### Timing requirements
- Response latency tracked (diagnostic — long latency on body-prompts may indicate dark-allergy)
- No millisecond precision needed — this is a reflective modality
- Session pacing is player-determined (no time pressure on responses)

### NPC/AI requirements
- Body-Speaker NPC: asks prompts, evaluates responses, provides feedback, models body-language
- Recruit NPC: receives teaching, asks clarifying questions, demonstrates learning
- LLM drives ALL NPC behaviour in this modality

### LLM requirements
- **Very High:** Core modality function depends on LLM
- Generates contextualised body-prompts linked to actual gameplay
- Evaluates response authenticity (felt-sense vs. performed/borrowed)
- Distinguishes concrete body-language from abstract/cognitive language
- Provides calibrated feedback (not too harsh, not too easy)
- Maintains conversation coherence across a session
- Tracks vocabulary development across sessions

### State persistence
- Body-vocabulary inventory (words the player has used accurately)
- Self-assessment accuracy history (verbal-performance correlation)
- Response patterns (latency, length, specificity, ownership)
- Drive-health signals from language patterns
- Shadow signals from language patterns
- Prompt history (what's been asked, what worked, what didn't)
- Teaching quality history (how well they transfer body-knowledge)
- Checkpoint position and phase
