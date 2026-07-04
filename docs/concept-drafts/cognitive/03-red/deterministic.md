# Cognitive / Red — Deterministic Game Concept

> **Axis:** The deterministic axis probes cognitive capacity through objective, measurable, reaction-time-based tasks with unambiguous right/wrong answers. This is the most "laboratory-like" modality — closest to validated neuropsychological assessment.
>
> **Why this axis for Cognitive/Red:** Executive functions at Red are concrete and measurable. n-back, Stroop, Go/No-Go, Simon, and Tower of London ARE the gold-standard assessments for this vibration. The deterministic axis delivers them as gameplay.

---

## 1. Game Identity

- **Title:** "The War-Mind Forge"
- **Core mechanic:** A sequence of EF micro-challenges framed as warrior-training exercises in a Red-stage fortress, where the player sharpens their "war-mind" through pattern-tracking, impulse control, and tactical planning.
- **Duration:** 3-8 minutes per session (infinite checkpoints)
- **Internal progression:** Training yard → Sparring ring → War-room → Siege command → Mastery trials

---

## 2. Catalyst Delivery

**Catalyst:** The game presents executive-function challenges at the player's contact boundary — just beyond comfortable, requiring genuine cognitive effort. Framed as "sharpening the mind for battle" (Red-resonant framing).

**Unconscious response:**
- *Submergent:* The player's relationship to cognitive effort surfaces. Do they attack it with aggression (dark-addiction)? Avoid it (dark-allergy)? Rush past it (golden-addiction)? Refuse the edge (golden-allergy)?
- *Emergent:* The pull toward greater cognitive capacity — can they tolerate the discomfort of not-yet-mastery? Can they reach without bypassing?

**Integration path:** The game's adaptive difficulty keeps the player at the contact boundary. Success is rewarded with progression (new training environments, harder challenges). The framing makes cognitive effort feel like POWER (Red-resonant) rather than obligation.

**Successful integration:** The player engages cognitive challenges with sovereign confidence — neither compulsive nor avoidant, neither rushing nor refusing. They ENJOY the sharpening.

---

## 3. Game Design

### Setup
The player enters a fortress training ground. Visual: Red-stage aesthetic (saffron/brass/weapon-walls). A "War-Mind Master" NPC presents challenges as warrior training. The framing is always power-resonant: "sharpen your mind to conquer."

### Interaction
- **n-back trials:** Sequences of rune-symbols flash on weapon-shields. Player taps when current matches n-back. Framed as "tracking enemy patterns."
- **Stroop trials:** Coloured aura-words appear on enemies. Player must respond to COLOUR not word. Framed as "seeing through deception."
- **Go/No-Go trials:** Enemy figures appear — some attack (GO: counter), some feint (NO-GO: hold). Framed as "reading the battlefield."
- **Tower of London trials:** Arrange siege weapons on platforms in minimum moves. Framed as "planning the assault."
- **Simon trials:** Directional strikes from enemies — respond to DIRECTION not visual position. Framed as "spatial awareness in combat."

### Feedback
- Correct: weapon-clash sound, brief power-flash, progress toward next checkpoint
- Incorrect: shield-block sound, brief pause, no punishment beyond lost progress
- Streak: increasing intensity of visual/audio feedback (building power)
- Mastery: new training environment unlocks, War-Mind Master acknowledges growth

### Difficulty Adaptation
- 1-up/2-down staircase on each task type independently
- Difficulty parameters: n-back level, Stroop SOA, Go/No-Go ratio, ToL move-count, Simon pace
- Adaptation is invisible — the player experiences "the training gets harder as I get stronger"

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Training Yard | 1-5 | Single task types, generous timing, clear feedback |
| Sparring Ring | 5-15 | Mixed task types, tighter timing, less explicit feedback |
| War-Room | 15-30 | Combined tasks (n-back + inhibition), strategic framing |
| Siege Command | 30-50 | Multi-task sequences, time pressure, transfer challenges |
| Mastery Trials | 50+ | Subtle variations, consistency challenges, maintenance mode |

---

## 4. Item Pool

### Item types
- **n-back sequences:** Rune-symbol sets (8 distinct symbols, combinatorial sequences)
- **Stroop stimuli:** Colour-word pairs (6 colours × 6 words = 36 base items, congruent/incongruent)
- **Go/No-Go stimuli:** Enemy figure variants (attack pose vs. feint pose, 20+ variants)
- **ToL problems:** Platform configurations (3-disk: 6 start states × 6 goal states = 36 problems)
- **Simon stimuli:** Directional attack animations (4 directions × congruent/incongruent = 8 base types)

### Minimum pool size
- n-back: Infinite (procedurally generated sequences)
- Stroop: 36 base items × difficulty variants = 100+
- Go/No-Go: 20+ figure variants × ratio configurations = 60+
- ToL: 36 problems × 3 difficulty tiers = 108
- Simon: 8 base types × pace variants = 40+

### Generation rules
- n-back sequences: Random with constraints (no more than 3 consecutive matches, balanced match/non-match ratio)
- Stroop: Balanced congruent/incongruent, no immediate repeats
- Go/No-Go: Ratio-controlled (70/30 → 80/20 → 85/15 as difficulty increases)
- ToL: Algorithmically generated from state-space graph (optimal solution length = difficulty)
- Simon: Balanced directional distribution, pace increases with mastery

### Drive/shadow mapping
- Snap-decision items → surface dark-addiction (cannot over-plan)
- Pure-cognitive items (no action frame) → surface dark-allergy (must think without doing)
- Self-selected difficulty items → surface golden-addiction (bypass) or golden-allergy (refusal)
- Foundation drill items → surface agape pathology (contempt for basics)
- Novel/unfamiliar items → surface agency golden pathology (cannot attempt without instruction)

---

## 5. Technical Requirements

### Input types
- Tap (n-back match, Go/No-Go response, Simon direction)
- Hold (sustained attention phases)
- Swipe (directional — Simon, ToL piece movement)
- No text input required for this modality

### Timing requirements
- RT measurement: millisecond precision required for Stroop, Simon, Go/No-Go
- Stimulus presentation: frame-accurate timing for SOA manipulation
- Response windows: configurable per task (500ms-3000ms range)

### NPC/AI requirements
- War-Mind Master: scripted dialogue with LLM-generated variations
- Training Partner NPC: async performance comparison (no real-time multiplayer required)

### LLM requirements
- Low: Contextual framing generation, dialogue variation
- Not required for core scoring or difficulty adaptation

### State persistence
- Per-task staircase levels (5 independent staircases)
- Drive-health running estimates (8 scores)
- Shadow-state running estimates (4 quadrant severities)
- Checkpoint position (which phase, which checkpoint within phase)
- Session history (last 20 sessions for trend analysis)
