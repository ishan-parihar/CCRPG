# Spiritual / Red — Language-Reflective Game Concept

> **Axis:** The language-reflective axis probes spiritual intelligence through VERBAL ARTICULATION — can the player put their values into words? Can they explain WHY something matters? At Red, this is concrete and egocentric: "Power matters because it keeps me alive." This modality tests the VERBAL dimension of spiritual intelligence.
>
> **Why this axis for Spiritual/Red:** The gap between verbal spiritual sophistication and actual value-coherence is the KEY diagnostic for the Premature Mystic. This modality provides the verbal data that cross-validates against deterministic. If they TALK about values beautifully but DON'T act on them — that's the signal.

---

## 1. Game Identity

- **Title:** "The Value-Tongue"
- **Core mechanic:** The player articulates their values verbally — naming what matters, explaining why, defending their hierarchy, and teaching their values to others. The game evaluates both QUALITY of articulation and ACCURACY (cross-validated against deterministic).
- **Duration:** 3-5 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Naming Values → Explaining Why → Defending Priority → Teaching Values → The Sacred Word

---

## 2. Catalyst Delivery

**Catalyst:** "What matters most to you? Why? More than what? How do you know?" The contact boundary is: "Can you put your sacred into words?"

**Unconscious response:**
- *Submergent:* How does the player relate to verbal value-articulation? Aggressive declaration (Zealot)? Silence/dismissal (Nihilist)? Sophisticated but hollow (Premature Mystic)? Concrete but rigid (Sacred-Refuser who can name but won't hold)?
- *Emergent:* Can they articulate more of their value-hierarchy? Can they explain WHY something matters?

**Integration path:** Rewards ACCURATE verbal value-articulation — words that match demonstrated behaviour. Not eloquence for its own sake but language that genuinely captures what the player values. Cross-validates against deterministic.

**Successful integration:** The player can name their values, explain why they matter, and defend their priority — and these verbal reports MATCH behavioural evidence.

---

## 3. Game Design

### Setup
The Value-Tongue: a verbal mirror for spiritual intelligence. The player articulates their values and the game evaluates clarity, consistency, and accuracy (cross-validated against behaviour). The aesthetic: Red-stage oath-speaking — the warrior declaring before the war-band what they fight for.

### Interaction
- **Naming Values (1-5):** "What matters most?" Select or state. Simple value-identification.
- **Explaining Why (5-15):** "Why does X matter?" Articulate reasoning. Evaluated for clarity and concreteness.
- **Defending Priority (15-30):** "Why X more than Y?" Articulate priority. Evaluated for consistency.
- **Teaching Values (30-50):** Explain your values to an NPC who doesn't understand. Evaluated for communicability.
- **The Sacred Word (50+):** Full verbal spiritual ecology — naming, explaining, defending, teaching, all consistent with behaviour.

### Feedback
- Accurate articulation → "Your words match your deeds. The oath is true."
- Aggressive → "You attacked instead of explained. WHY does it matter? Not why others are wrong."
- Silent → "One word. The war-band waits. What do you fight for?"
- Sophisticated but hollow → "Beautiful words. But your actions don't match. Simpler. Truer."

### Difficulty Adaptation
- Verbal demand: single word → sentence → explanation → defence → teaching
- Accuracy requirement: any value → consistent value → behaviour-matching value
- Priority complexity: single value → binary priority → multi-value hierarchy
- Audience: self → ally → group → hostile questioner

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Naming Values | 1-5 | State one value; simple identification |
| Explaining Why | 5-15 | Articulate reasoning; clarity evaluated |
| Defending Priority | 15-30 | Priority articulation; consistency evaluated |
| Teaching Values | 30-50 | Communicate values to NPC; clarity evaluated |
| The Sacred Word | 50+ | Full verbal spiritual ecology |

---

## 4. Item Pool Specification

### Item types
- **Value-naming prompts:** "What matters most?" with verification
- **Explanation prompts:** "Why does X matter?" with clarity evaluation
- **Priority-defence prompts:** "Why X over Y?" with consistency checking
- **Teaching tasks:** Explain values to NPC; evaluated for communicability
- **Cross-validation tasks:** Verbal value vs. behavioural evidence comparison

### Minimum pool size
- 25+ naming, 20+ explanation, 20+ priority-defence, 15+ teaching, 10+ cross-validation

### Drive/shadow mapping
- Aggressive declarations → dark-addiction; verbal absence → dark-allergy
- Sophisticated but incoherent → golden-addiction; qualified/uncommitted → golden-allergy

---

## 5. Technical Requirements

### Input types
- Text input (value-naming, explanations); tap-to-select (forced-choice values); multiple-choice (priority selection)

### Timing requirements
- No time pressure on verbal responses; quality over speed
- Cross-session tracking for consistency verification

### NPC/AI requirements
- "Student" NPC who needs values explained (teaching phase)
- "Questioner" NPC who challenges priority (defence phase)
- Behavioural record for cross-validation

### LLM requirements
- **Very High:** Evaluates verbal quality, detects sophistication-without-coherence, generates adaptive prompts, assesses teaching effectiveness. Critical for distinguishing genuine articulation from performed spirituality.

### State persistence
- Full verbal response history; value-naming consistency; explanation quality scores; priority consistency; teaching effectiveness; verbal-behavioural alignment ratio; drive/shadow signals; fatigue state; checkpoint position
