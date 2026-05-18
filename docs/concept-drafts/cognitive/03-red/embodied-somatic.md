# Cognitive / Red — Embodied-Somatic Game Concept

> **Axis:** The embodied-somatic axis probes cognitive capacity through BODY-BASED interaction — rhythm, timing, spatial movement, and physical pattern-tracking. This modality accesses the EMBODIED dimension of cognition: not "can you think about it" but "can you think WITH your body."
>
> **Why this axis for Cognitive/Red:** At Red, the body IS the primary instrument of power. Cognition-through-body means: tracking patterns through rhythm (n-back as drumbeat), inhibiting through timing (Go/No-Go as dodge/strike), planning through spatial movement (ToL as physical navigation). This axis reveals whether cognitive capacity is genuinely embodied or only cerebral.

---

## 1. Game Identity

- **Title:** "The Drum and the Blade"
- **Core mechanic:** The player engages cognitive tasks through physical interaction — tapping rhythms, timing strikes, navigating spatial sequences with swipe/movement — where the BODY is the interface for cognitive operations.
- **Duration:** 3-7 minutes per session (infinite checkpoints)
- **Internal progression:** Single-rhythm → Counter-rhythm → Rhythm+Strike → Spatial-rhythm → Battle-dance

---

## 2. Catalyst Delivery

**Catalyst:** The game presents cognitive challenges that REQUIRE bodily engagement — you cannot solve them by thinking alone; you must move, tap, time, and navigate. The contact boundary is: "Can your body express what your mind knows?"

**Unconscious response:**
- *Submergent:* The player's mind-body relationship surfaces. Do they over-think the rhythm (dark-addiction)? Refuse to engage the cognitive layer of movement (dark-allergy)? Perform complex movements without genuine cognitive tracking (golden-addiction)? Refuse to let movement become more complex (golden-allergy)?
- *Emergent:* The pull toward mind-body integration — can they let thinking and moving become one act?

**Integration path:** The game rewards FLOW — the state where cognition and movement are unified. Over-thinking disrupts rhythm. Under-thinking produces errors. The sweet spot is embodied cognition: thinking-through-moving.

**Successful integration:** The player demonstrates cognitive capacity THROUGH physical action — tracking patterns in rhythm, inhibiting through timing, planning through spatial navigation — without separating mind from body.

---

## 3. Game Design

### Setup
The player enters a war-drum circle in the Red-stage fortress. War-drums of different sizes surround them. A "Drum-Master" NPC (battle-scarred percussionist) demonstrates patterns. The aesthetic: firelight, weapon-rhythm, the pulse of the war-camp.

### Interaction
- **Rhythm-tracking (n-back):** A sequence of drum-hits plays. Player taps when current hit matches n-back. The RHYTHM carries the cognitive task — timing matters.
- **Strike-timing (Go/No-Go):** Enemy figures appear on-beat. Strike on attack-beat (GO), hold on feint-beat (NO-GO). Timing must be rhythmic.
- **Spatial-rhythm (Simon/Corsi):** Directional drum-hits (left/right/up/down). Player swipes in sequence. The spatial pattern IS the rhythm.
- **Pattern-navigation (ToL):** Move through a spatial grid on-beat, reaching target positions in minimum moves. Planning expressed through movement.
- **Counter-rhythm (Stroop):** Two rhythms play simultaneously. Player must follow ONE and ignore the other. The body must inhibit the wrong rhythm.

### Feedback
- On-beat correct: satisfying drum-hit sound, visual pulse, rhythm builds
- Off-beat: rhythm stutters, brief silence, then recovers
- Streak: rhythm intensifies, additional instruments join, the groove deepens
- Mastery: new drum unlocks, Drum-Master acknowledges with a war-cry

### Difficulty Adaptation
- Tempo: 60bpm → 80bpm → 100bpm → 120bpm
- Cognitive load: n=1 → n=2 within rhythm; 1-track → 2-track
- Spatial complexity: 2-direction → 4-direction → 6-direction
- Timing precision: ±200ms → ±150ms → ±100ms → ±75ms

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Single-Rhythm | 1-5 | One drum, one pattern, generous timing |
| Counter-Rhythm | 5-15 | Two competing rhythms, must track one |
| Rhythm+Strike | 15-30 | Cognitive tracking embedded in combat timing |
| Spatial-Rhythm | 30-50 | Directional patterns, movement-based cognition |
| Battle-Dance | 50+ | Full integration: rhythm + tracking + spatial + inhibition |

---

## 4. Item Pool Specification

### Item types
- **Rhythm sequences:** Beat patterns at various tempos (procedurally generated)
- **Strike patterns:** Attack/feint sequences with rhythmic structure
- **Spatial sequences:** Directional patterns (Corsi-like) embedded in rhythm
- **Navigation grids:** Spatial planning problems with beat-based movement
- **Counter-rhythms:** Competing patterns requiring selective attention

### Minimum pool size
- Rhythm sequences: Infinite (procedurally generated from tempo + complexity parameters)
- Strike patterns: 30+ base patterns × tempo variants
- Spatial sequences: 20+ base sequences × direction variants
- Navigation grids: 25+ grid configurations × difficulty tiers
- Counter-rhythms: 15+ rhythm pairs × tempo variants

### Generation rules
- Rhythms generated from musical constraints (syncopation rules, groove patterns)
- Difficulty scales with: tempo, cognitive load (n-back level), spatial complexity, timing precision
- All patterns must be RHYTHMICALLY SATISFYING (not just cognitively challenging)
- Shadow-probing items: feel-based (no tracking) for dark-addiction; tracking-heavy for dark-allergy

### Drive/shadow mapping
- Assist acceptance/rejection → Agency probing
- Synchronisation quality → Communion probing
- Advancement rate → Eros probing
- Foundation rhythm quality → Agape probing
- Rigid/mechanical timing on simple grooves → dark-addiction signal
- Good timing but poor tracking → dark-allergy signal
- Flashy but inaccurate → golden-addiction signal
- Tension/withdrawal at complexity increase → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- Tap (primary — beat-synchronised)
- Hold (sustained notes)
- Swipe (directional — spatial patterns)
- Multi-touch (advanced: simultaneous taps for polyrhythm)

### Timing requirements
- **Critical:** Millisecond-precision timing for rhythm assessment
- Audio-visual synchronisation must be frame-perfect
- Input latency compensation required (device-specific calibration)
- Beat-window calculation: ±tolerance based on difficulty level

### NPC/AI requirements
- Drum-Master NPC: demonstrates patterns, provides feedback in-character
- Synchronisation Partner NPC: plays counter-rhythm for pairing challenges
- No real-time multiplayer required (async rhythm comparison possible)

### LLM requirements
- **Low:** Contextual framing only. Core mechanics are algorithmic.
- Rhythm generation is procedural (not LLM)
- Scoring is timing-based (not LLM)

### State persistence
- Timing precision history (running average, trend)
- Pattern-tracking accuracy (d' per complexity level)
- Tempo comfort zone (current stable tempo)
- Complexity ceiling (current stable cognitive load within rhythm)
- Drive-health signals from engagement patterns
- Shadow signals from timing/tracking patterns
- Checkpoint position and phase
