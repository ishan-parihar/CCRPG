# Intrapersonal / Red — Language-Reflective Game Concept

> **Axis:** The language-reflective axis probes self-knowledge through VERBAL ARTICULATION — can the player put their inner experience into words? At Red, this is primitive but crucial: "I am angry" is the first verbal self-knowledge. This modality tests the VERBAL dimension of intrapersonal intelligence.
>
> **Why this axis for Intrapersonal/Red:** Language is the bridge between having a self and KNOWING a self. At Red, verbal self-knowledge is concrete and egocentric: "I want," "I am," "I will." The gap between verbal sophistication and actual self-knowledge is the key diagnostic — the Premature Witness speaks beautifully but knows nothing; the Unexamined knows but cannot speak.

---

## 1. Game Identity

- **Title:** "The Self-Tongue"
- **Core mechanic:** The player articulates their inner experience verbally — naming states, explaining choices, predicting behaviour, and reflecting on patterns. The game evaluates both the QUALITY of articulation and its ACCURACY (cross-validated against deterministic).
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Naming States → Explaining Choices → Predicting Self → Teaching Self-Knowledge → The Inner Voice

---

## 2. Catalyst Delivery

**Catalyst:** "Say what you feel. Explain why you chose that. Tell me what you'll do next." The contact boundary is: "Can you put your inner life into words?"

**Unconscious response:**
- *Submergent:* How does the player relate to verbal self-knowledge? Grandiose narration (Narcissist)? Silence/dismissal (Unexamined)? Sophisticated but hollow (Premature Witness)? Concrete but rigid (Identity-Clinger)?
- *Emergent:* Can they articulate more of their inner experience? Can they find words for what was previously wordless?

**Integration path:** Rewards ACCURATE verbal self-knowledge — words that match reality. Not eloquence for its own sake but language that genuinely captures inner experience. Cross-validates against deterministic: if they SAY "calm" but BEHAVE "anxious," the gap is surfaced.

**Successful integration:** The player can name their states, explain their choices, and predict their behaviour — and these verbal reports MATCH observable reality.

---

## 3. Game Design

### Setup
The Self-Tongue: a verbal mirror where the player must put their inner life into words. The game presents prompts, the player responds verbally (text input or selection), and the game evaluates accuracy against behavioural evidence. The aesthetic: Red-stage warrior speaking to a war-council — declaring intent, naming state, explaining choice. Words as weapons of self-knowledge.

### Interaction
- **Naming States (1-5):** "What do you feel right now?" Select from options. Verified against indicators.
- **Explaining Choices (5-15):** "Why did you choose X?" Articulate motivation. Verified against pattern.
- **Predicting Self (15-30):** "What will you do when Y happens?" Verbal prediction. Verified against behaviour.
- **Teaching Self-Knowledge (30-50):** Explain your own patterns to an NPC. Verified against cross-session data.
- **The Inner Voice (50+):** Full verbal self-knowledge — naming, explaining, predicting, teaching, all accurate.

### Feedback
- Accurate articulation → "Your words match your truth. That's power."
- Grandiose → "Beautiful words. But they don't match what you did. Simpler. Truer."
- Silent → "One word. That's all the mirror needs. Speak."
- Sophisticated but wrong → "You sound wise. But you predicted X and did Y. Know yourself simply first."

### Difficulty Adaptation
- Verbal demand: forced-choice → short response → open articulation
- Accuracy requirement: binary match → nuanced match → predictive accuracy
- State complexity: basic (angry/calm) → compound (angry-and-afraid) → contextual
- Temporal scope: current state → recent choice → future prediction → pattern

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Naming States | 1-5 | Select current state from options; binary accuracy |
| Explaining Choices | 5-15 | Articulate motivation; pattern-verified |
| Predicting Self | 15-30 | Verbal self-prediction; behaviourally verified |
| Teaching Self-Knowledge | 30-50 | Explain own patterns to NPC; cross-session verified |
| The Inner Voice | 50+ | Full verbal self-knowledge ecology |

---

## 4. Item Pool Specification

### Item types
- **State-naming prompts:** "What do you feel?" with verification options
- **Choice-explanation prompts:** "Why did you choose X?" with pattern-checking
- **Self-prediction prompts:** "What will you do when...?" with behavioural verification
- **Pattern-teaching tasks:** Explain own patterns to NPC; verified against data
- **Vocabulary-expansion tasks:** Find words for previously unnamed states

### Minimum pool size
- 30+ state-naming, 25+ choice-explanation, 20+ self-prediction, 15+ pattern-teaching, 10+ vocabulary-expansion

### Drive/shadow mapping
- Grandiose narration → dark-addiction; verbal absence → dark-allergy
- Sophisticated but inaccurate → golden-addiction; accurate but narrow → golden-allergy

---

## 5. Technical Requirements

### Input types
- Text input (short verbal responses); tap-to-select (forced-choice state labels); multiple-choice (explanation options); open response (pattern descriptions)

### Timing requirements
- No time pressure on verbal responses; quality over speed
- Cross-session tracking essential for pattern verification

### NPC/AI requirements
- "Mirror" NPC that reflects back what the player says (for accuracy checking)
- "Student" NPC that the player teaches about themselves (pattern-teaching phase)
- Behavioural indicator system for verification

### LLM requirements
- **Very High:** Evaluates verbal quality, detects sophistication-without-accuracy, generates adaptive prompts, assesses pattern descriptions. Critical for distinguishing genuine articulation from performed self-awareness.

### State persistence
- Full verbal response history; state-naming accuracy trends; explanation quality scores; self-prediction verbal accuracy; pattern descriptions + validation; vocabulary range; sophistication-vs-accuracy ratio; drive/shadow signals; fatigue state; checkpoint position
