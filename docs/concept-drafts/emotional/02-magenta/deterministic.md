# Emotional / Magenta — Deterministic Game Concept

> **Axis:** The deterministic axis probes emotional intelligence through OBJECTIVE AFFECT-SENSING — can the player detect emotional tone in scenes? At Magenta, this is: "What mood is this place?" Not reading faces (Red+) but sensing the ATMOSPHERE. The mood-of-the-zone.
>
> **Why this axis for Emotional/Magenta:** Before emotions can be read in individuals (Red), they must be sensed in ENVIRONMENTS. The Magenta emotional capacity is atmospheric — feeling the mood of a place. This modality measures that capacity objectively.

---

## 1. Game Identity

- **Title:** "The Mood-Sense"
- **Core mechanic:** Scenes with distinct emotional atmospheres (colour, music, movement, weather) are presented. The player identifies the mood. Not faces, not words — ATMOSPHERE. Can they sense what the environment feels like?
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The First Mood → The Shifting Mood → The Mixed Mood → The Subtle Mood → The Living Atmosphere

---

## 2. Catalyst Delivery

**Catalyst:** "What does this place feel like? Happy? Sad? Angry? Scared? Calm?" The contact boundary is: "Can you sense the emotional tone of an environment?"

**Unconscious response:**
- *Submergent:* How does the player relate to environmental emotion? The Mood-Flooder is overwhelmed by every scene. The Affect-Denier reports "nothing." The Premature Empath gives sophisticated answers that don't match the actual cues. The Feeling-Refuser detects then avoids.
- *Emergent:* Can they sense accurately without drowning or denying?

**Integration path:** Rewards ACCURATE AFFECT-SENSING — detecting the mood without being overwhelmed by it or missing it entirely. Sensing, not drowning. Detecting, not denying.

**Successful integration:** The player accurately identifies environmental mood at moderate intensity — neither flooded nor flat.

---

## 3. Game Design

### Setup
The Mood-Sense: an atmospheric sensing space. Scenes with distinct emotional tones created through colour, music, movement, weather, and spatial design. No faces, no words — pure atmosphere. The player senses and identifies.

### Interaction
- **The First Mood (1-5):** Single clear mood (happy/sad/angry/scared/calm). Obvious cues.
- **The Shifting Mood (5-15):** Mood changes within a scene. Can they track the shift?
- **The Mixed Mood (15-30):** Two moods present simultaneously. Can they sense both?
- **The Subtle Mood (30-50):** Low-intensity moods. Quiet feelings. Requires calibration.
- **The Living Atmosphere (50+):** Full atmospheric sensing: shifting, mixed, subtle, layered.

### Feedback
- Accurate sensing → "You felt it. That's the mood. Your sensing is alive."
- Overwhelmed → "Too much. Softer. The mood is quieter than you think. Listen gently."
- Nothing detected → "Something IS here. The colour... the sound... what do they feel like?"
- Over-interpretation → "Simpler. One feeling. What's the MAIN mood? Just that."
- Detected but avoided → "You sensed it. Now stay. One more moment. What else is there?"

### Difficulty Adaptation
- Mood intensity: high → moderate → low → very subtle
- Cue clarity: obvious (colour + music + weather) → moderate → subtle (single cue)
- Mood complexity: single → shifting → mixed → layered
- Response options: 3 choices → 5 choices → open-ended
- Scene duration: long exposure → brief exposure

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Mood | 1-5 | Single clear mood; obvious cues |
| The Shifting Mood | 5-15 | Mood transitions within scenes |
| The Mixed Mood | 15-30 | Two simultaneous moods |
| The Subtle Mood | 30-50 | Low-intensity; calibration required |
| The Living Atmosphere | 50+ | Full atmospheric complexity |

---

## 4. Item Pool

### Item types
- **Single-mood scenes:** Clear emotional atmosphere (5 basic moods × multiple variants)
- **Shifting scenes:** Mood transitions (A→B, with various A and B)
- **Mixed scenes:** Two simultaneous moods (happy+sad, angry+scared, etc.)
- **Subtle scenes:** Low-intensity versions of all moods
- **Ambiguous scenes:** Scenes where mood is genuinely unclear (tests over-interpretation)

### Minimum pool size
- 30+ single, 20+ shifting, 15+ mixed, 15+ subtle, 10+ ambiguous

### Drive/shadow mapping
- Extreme intensity ratings → dark-addiction; zero/neutral ratings → dark-allergy
- Over-sophisticated answers → golden-addiction; accurate but disengaged → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-to-select (mood choice from options); intensity slider; hold-to-linger

### Timing requirements
- Response latency tracked (too fast = avoidance; too slow = overwhelm); scene exposure duration

### NPC/AI requirements
- Scene generation system (colour + music + movement + weather → mood)
- Intensity calibration system (scenes at precise intensity levels)
- Optional: companion who shares their sensing (for communion probing)

### LLM requirements
- **Low:** Feedback generation; scene description. Core mood-matching entirely algorithmic with pre-designed scenes.

### State persistence
- Mood-identification accuracy; intensity calibration scores; shift-detection rates; mixed-mood accuracy; engagement duration; overwhelm indicators (extreme ratings); denial indicators (flat ratings); over-interpretation indicators (complexity exceeds scene); avoidance indicators (fast + minimal); drive/shadow signals; fatigue state; checkpoint position
