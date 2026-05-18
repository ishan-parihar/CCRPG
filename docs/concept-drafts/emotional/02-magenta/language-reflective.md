# Emotional / Magenta — Language-Reflective Game Concept

> **Axis:** The language-reflective axis probes emotional intelligence through VERBAL AFFECT-EXPRESSION — can the player put feelings into words? At Magenta, this is proto-affect-labelling: "It feels... sad?" The first attempt to name what the atmosphere holds. Not sophisticated emotion vocabulary — just the first word for a feeling.
>
> **Why this axis for Emotional/Magenta:** Before emotions can be discussed, analysed, or regulated (Red+), they must be NAMED. The Magenta emotional-language capacity is: "I can put one word on what this feels like." This modality tests whether the player can bridge sensing and speaking.

---

## 1. Game Identity

- **Title:** "The Feeling-Word"
- **Core mechanic:** The player encounters emotional atmospheres and must find WORDS for them. Not choosing from a list (that's deterministic) — generating language. "What does this feel like? Say it." The bridge between sensing and speaking.
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The First Word → The Feeling-Name → The Mood-Story → The Shared Word → The Speaking Heart

---

## 2. Catalyst Delivery

**Catalyst:** "You feel something. What's the word? Even one word. What does this feel like?" The contact boundary is: "Can you put feelings into language?"

**Unconscious response:**
- *Submergent:* How does the player relate to emotional language? The Mood-Flooder produces torrents of feeling-words without precision. The Affect-Denier says "nothing" or "fine." The Premature Empath produces sophisticated vocabulary disconnected from actual sensing. The Feeling-Refuser can sense but won't name.
- *Emergent:* Can they find ONE accurate word for what they sense?

**Integration path:** Rewards ACCURATE AFFECT-LABELLING — finding words that match the felt sense. Not too many words (flooding), not "nothing" (denial), not sophisticated words that don't match (bypass), not refusal to name.

**Successful integration:** The player finds simple, accurate words for environmental moods — the bridge between feeling and language.

---

## 3. Game Design

### Setup
The Feeling-Word: a verbal affect-labelling space. Emotional atmospheres are presented and the player generates words for them. The aesthetic: Magenta-stage word-garden — feelings float as colours/shapes, and when the player names them, the word appears as a glowing seed that grows into a plant. Named feelings become living things.

### Interaction
- **The First Word (1-5):** Clear mood → find one word. "What does this feel like?"
- **The Feeling-Name (5-15):** More nuanced moods → find more precise words.
- **The Mood-Story (15-30):** String feeling-words together: "First it felt X, then Y."
- **The Shared Word (30-50):** Share feeling-words with companion; build shared vocabulary.
- **The Speaking Heart (50+):** Full affect-labelling: sense → name → share → story.

### Feedback
- Accurate simple word → "Yes! That's the feeling. Your word caught it. See it grow."
- Word-flood → "Too many. Which one is LOUDEST? Just that one. Let the others wait."
- Nothing → "Something is here. Not a word yet? A colour? A sound? Anything that fits."
- Over-sophisticated → "Simpler. What would a child say? That word. The simple one."
- Refuses to name → "Safe here. Just between us. Even a whisper. What's the feeling?"

### Difficulty Adaptation
- Mood clarity: obvious → moderate → subtle → ambiguous
- Response format: choose from 3 → choose from 5 → generate own word
- Mood complexity: single → shifting → mixed
- Naming precision required: basic (happy/sad) → moderate (lonely/excited) → nuanced
- Social component: solo → shared → co-created

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Word | 1-5 | One word for clear moods |
| The Feeling-Name | 5-15 | More precise words for nuanced moods |
| The Mood-Story | 15-30 | Sequences of feeling-words |
| The Shared Word | 30-50 | Sharing emotional language with companion |
| The Speaking Heart | 50+ | Full affect-labelling integration |

---

## 4. Item Pool Specification

### Item types
- **Clear-mood scenes:** Obvious emotional atmospheres requiring basic labels
- **Nuanced scenes:** Moods requiring more precise vocabulary
- **Shifting scenes:** Moods that change (requiring sequential labelling)
- **Ambiguous scenes:** Moods with no single "right" answer (tests over-interpretation)
- **Shared scenes:** Moods for co-labelling with companion

### Minimum pool size
- 30+ clear, 20+ nuanced, 15+ shifting, 15+ ambiguous, 10+ shared

### Drive/shadow mapping
- Word-flood → dark-addiction; "nothing"/blank → dark-allergy
- Over-sophisticated/inaccurate → golden-addiction; sensing without naming → golden-allergy

---

## 5. Technical Requirements

### Input types
- Verbal (speech-to-text for feeling-words); tap-to-select (word-bank fallback); text input

### Timing requirements
- Response latency tracked (too fast = avoidance; too slow = overwhelm/block); no time pressure on generation

### NPC/AI requirements
- Scene generation with ground-truth mood tags
- Companion who shares own feeling-words (for communion probing)
- Word-garden visualization (named feelings become plants)

### LLM requirements
- **Very High:** Word-mood semantic matching; vocabulary sophistication assessment; over-interpretation detection; word-flood vs. precision discrimination; novel word evaluation; shared vocabulary quality assessment.

### State persistence
- Word-mood match accuracy; vocabulary range; word-count patterns; precision levels; novel-word quality; shared vocabulary growth; flood indicators; blank indicators; sophistication-without-accuracy indicators; naming-refusal indicators; drive/shadow signals; fatigue state; checkpoint position
