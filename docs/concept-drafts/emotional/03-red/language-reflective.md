# Emotional / Red — Language-Reflective Game Concept

> **Axis:** The language-reflective axis probes emotional capacity through VERBAL and METACOGNITIVE channels — can the player NAME what they feel? DESCRIBE emotional states? EXPLAIN why emotions arise? At Red, this is basic affect-labelling: "I am angry because they took my territory."
>
> **Why this axis for Emotional/Red:** Language is the bridge between felt-emotion and conscious access. At Red, emotional vocabulary is CONCRETE and LIMITED (5 basic emotions, simple causal attributions). This axis tests whether emotion has reached CONSCIOUS VERBAL ACCESS — and critically, whether verbal claims MATCH demonstrated capacity (cross-validated against deterministic).

---

## 1. Game Identity

- **Title:** "The Wroth-Tongue"
- **Core mechanic:** The player uses language to name, describe, and explain emotions — their own and others'. The game evaluates whether verbal emotional intelligence matches behavioural emotional intelligence, surfacing gaps between what they SAY and what they CAN DO.
- **Duration:** 3-6 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Naming → Describing → Explaining → Predicting → Teaching

---

## 2. Catalyst Delivery

**Catalyst:** The game asks the player to PUT WORDS to emotion. "What is this warrior feeling? Why? What will happen next because of it?" The contact boundary is: "Can you bring emotion into language without losing its truth?"

**Unconscious response:**
- *Submergent:* The player's verbal-emotional relationship surfaces. Do they have words for feelings? Do their words match reality? Do they over-verbalise (golden-addiction)? Under-verbalise (dark-allergy)?
- *Emergent:* Can they reach toward more precise emotional language? Can they explain, not just name?

**Integration path:** The game rewards ACCURATE verbal-emotional mapping. Words that match demonstrated capacity score high. Words that exceed demonstrated capacity (verbal bypass) are flagged. Words that fall below demonstrated capacity (under-verbalisation) are gently expanded.

**Successful integration:** The player's emotional vocabulary accurately reflects their emotional capacity — neither inflated nor impoverished.

---

## 3. Game Design

### Setup
The Wroth-Tongue: a Red-stage verbal-emotional training ground. The player speaks (types/selects) emotional language in response to prompts. An NPC "Tongue-Master" evaluates accuracy and guides vocabulary development. The aesthetic: war-council, firelit discussion, naming the enemy's weakness.

### Interaction
- **Naming:** "What emotion is this?" → player selects/types a label
- **Describing:** "Describe what anger feels like in the body" → player generates description
- **Explaining:** "Why is this warrior angry?" → player provides causal attribution
- **Predicting:** "What will this angry warrior do next?" → player predicts behaviour from emotion
- **Teaching:** "Explain to the recruit what pride feels like" → player teaches emotional concept

### Feedback
- Accurate naming → "Yes. You see it and you can SAY it. That's the warrior's tongue."
- Inaccurate → "Look again. What does THAT face say? Not what you THINK — what you SEE."
- Vocabulary-accuracy match → "Your words match your eyes. Truth."
- Vocabulary-accuracy mismatch → "Your tongue says one thing. Your eyes say another. Which is true?"

### Difficulty Adaptation
- Vocabulary demand: single-word labels → descriptions → explanations → predictions → teaching
- Emotion complexity: single basic → mixed → subtle → contextual
- Accuracy requirement: approximate → precise → nuanced
- Speed: unlimited → 10s → 5s response window

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Naming | 1-5 | Single-word labels for obvious emotions |
| Describing | 5-15 | Multi-word descriptions; body-sensation language |
| Explaining | 15-30 | Causal attributions; "because" statements |
| Predicting | 30-50 | Behaviour prediction from emotional state |
| Teaching | 50+ | Explaining emotions to others; full verbal mastery |

---

## 4. Item Pool Specification

### Item types
- **Naming prompts:** Face/voice stimuli requiring emotion labels
- **Description prompts:** Situations requiring emotional description
- **Explanation prompts:** Scenarios requiring causal emotional reasoning
- **Prediction prompts:** Emotional states requiring behavioural prediction
- **Teaching prompts:** Concepts requiring clear emotional explanation

### Minimum pool size
- 50+ naming prompts (10+ per emotion); 30+ description prompts; 25+ explanation scenarios; 20+ prediction scenarios; 15+ teaching prompts

### Generation rules
- Naming prompts share stimulus pool with deterministic (enables cross-validation)
- Description prompts generated from emotional situations (varied contexts)
- Explanation prompts require causal reasoning (not just labelling)
- All prompts have validated "acceptable response" ranges (not single correct answers)

### Drive/shadow mapping
- Performative vs. genuine language → Agency dark
- Self-generated vocabulary → Agency golden
- Projection in other-descriptions → Communion dark
- Teaching quality → Communion golden
- Vocabulary intensity (always maximum) → dark-addiction
- Vocabulary absence → dark-allergy
- Vocabulary-accuracy mismatch → golden-addiction
- Vocabulary asymmetry (power only) → golden-allergy

---

## 5. Technical Requirements

### Input types
- Text input (typed emotional language) OR selection from vocabulary options
- Voice input (spoken emotional language — if available)
- Timed response (language generation under time pressure)

### Timing requirements
- Response time tracked (diagnostic — faster = more automatic access)
- No millisecond precision needed; seconds-level measurement

### NPC/AI requirements
- Tongue-Master NPC: evaluates language, provides feedback, models vocabulary
- Stimulus NPCs: display emotions for naming/describing
- Recruit NPC: receives teaching (for teaching phase)

### LLM requirements
- **Very High:** Evaluates all verbal responses — naming accuracy, description quality, explanation coherence, prediction validity, teaching effectiveness
- Must detect vocabulary-accuracy mismatches (cross-referencing deterministic data)
- Must assess language sophistication level (Red-appropriate vs. premature)

### State persistence
- Vocabulary inventory (words used accurately); naming accuracy per emotion; description quality trends; explanation quality trends; vocabulary-accuracy correlation; intensity patterns; vocabulary range; drive/shadow signals; checkpoint position
