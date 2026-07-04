# Somatic / Red — Deterministic Game Concept

> **Axis:** The deterministic axis probes somatic capacity through OBJECTIVE, MEASURABLE body-based tasks — reaction time, rhythm synchronisation, posture hold, motor sequencing. This modality accesses the QUANTIFIABLE dimension of body intelligence: milliseconds, accuracy percentages, hold durations. No interpretation needed — the body either performs or it doesn't.
>
> **Why this axis for Somatic/Red:** At Red, the body is a power-instrument. This axis measures that instrument directly: How fast? How strong? How rhythmic? How sustained? The tasks are framed as warrior training — speed drills, endurance holds, combat rhythms — because at Red, the body trains to DOMINATE.

---

## 1. Game Identity

- **Title:** "The Striker's Forge"
- **Core mechanic:** The player trains their body through escalating physical challenges — reaction drills, rhythm locks, endurance holds, and combat sequences — framed as warrior conditioning in a Red-stage training ground.
- **Duration:** 3-8 minutes per session (infinite checkpoints; fatigue-aware — session auto-shortens under detected fatigue)
- **Internal progression:** Reflex Drills → Rhythm Locks → Endurance Holds → Combat Sequences → The Gauntlet

---

## 2. Catalyst Delivery

**Catalyst:** The game presents physical demands at the contact boundary of the player's current capacity. "Can your body DO this?" The challenge is concrete, immediate, and undeniable — the body either responds in time or it doesn't.

**Unconscious response:**
- *Submergent:* The player's relationship to their body surfaces. Do they over-react (dark-addiction)? Disengage (dark-allergy)? Impose precision over power (golden-addiction)? Refuse structure (golden-allergy)?
- *Emergent:* The pull toward greater physical capacity — can they be faster? More sustained? More rhythmic?

**Integration path:** The game rewards EMBODIED performance — not just correct timing but PRESENT timing. A reaction that comes from genuine body-readiness scores higher than one from anxious hyper-vigilance. The body learns: presence IS power.

**Successful integration:** The player demonstrates physical capacity with BOTH power and presence — fast without frantic, sustained without rigid, rhythmic without mechanical.

---

## 3. Game Design

### Setup
A Red-stage training ground: stone floor, weapon racks, striking posts, a war-drum in the corner. The Forge-Master (NPC) oversees training. The aesthetic is raw, physical, powerful — brass fixtures, firelight, the smell of effort implied through visual heat-shimmer.

### Interaction
- **Reflex Drills:** Visual stimulus appears → tap as fast as possible. Simple RT, then choice RT (tap LEFT or RIGHT based on stimulus colour/position).
- **Rhythm Locks:** War-drum beats → tap in sync. Tempo starts comfortable, varies. Off-beat = miss. On-beat = strike lands.
- **Endurance Holds:** Hold input (press and maintain) while interference appears (visual distractors, screen shake). Release = stance broken.
- **Combat Sequences:** 2-3 action sequences displayed → execute in order with correct timing. Strike-dodge-strike. Dodge-hold-strike.
- **The Gauntlet:** Mixed drill types in rapid succession. Tests all capacities in combination.

### Feedback
- Successful reaction → powerful strike animation, satisfying impact sound, target destroyed
- Missed reaction → whiff animation, target unharmed, brief vulnerability
- Perfect rhythm → combo multiplier, war-drum intensifies, visual power-glow
- Broken rhythm → combo breaks, drum falters, power-glow fades
- Posture held → damage mitigation visual, stability glow, Forge-Master nod
- Posture broken → stumble animation, vulnerability window, Forge-Master correction

### Difficulty Adaptation
- RT window: 500ms → 400ms → 350ms → 300ms → 250ms
- Rhythm tempo: 80 BPM → 100 → 120 → variable (80-140)
- Hold duration: 2s → 3s → 4s → 5s → 6s (with increasing interference)
- Sequence length: 2 → 3 → 4 actions
- Gauntlet density: 3 drills → 5 → 7 → 10 in sequence

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Reflex Drills | 1-5 | Simple RT only; generous windows; no interference |
| Rhythm Locks | 5-15 | Rhythm introduced; comfortable tempo; wide tolerance |
| Endurance Holds | 15-25 | Posture holds added; mild interference; short durations |
| Combat Sequences | 25-40 | Multi-action sequences; timing + ordering combined |
| The Gauntlet | 40+ | All drill types mixed; full capacity tested in combination |

---

## 4. Item Pool

### Item types
- **RT stimuli:** Visual targets with varied positions, colours, sizes (simple and choice variants)
- **Rhythm patterns:** Beat sequences at varied tempos with varied complexity (steady → syncopated)
- **Interference sets:** Visual/auditory distractors for posture-hold phases
- **Motor sequences:** Ordered action combinations (strike/dodge/hold in various arrangements)
- **Gauntlet configurations:** Mixed-drill sequences with varied composition

### Minimum pool size
- 40+ RT stimulus configurations (position × colour × size × timing)
- 30+ rhythm patterns (tempo × complexity × duration)
- 20+ interference sets (type × intensity × duration)
- 25+ motor sequences (length × timing constraint × action types)
- 15+ gauntlet configurations (composition × density × duration)

### Generation rules
- RT stimuli: randomised within difficulty-appropriate parameters (window size, ISI jitter)
- Rhythm patterns: generated from tempo + complexity parameters; always musically coherent
- Interference: scaled to current hold-duration capacity; never exceeds demonstrated tolerance by >20%
- Motor sequences: generated from action vocabulary; always physically possible in sequence
- Gauntlets: composed from mastered drill types; introduces one new element per gauntlet

### Drive/shadow mapping
- Competitive comparison response → Agency probing
- Synchronisation quality → Communion probing
- Mastered-drill engagement → Eros/Agape probing
- Rest-phase behaviour → dark-addiction signal
- First-trial engagement quality → dark-allergy signal
- Force-vs-precision ratio on power drills → golden-addiction signal
- External-rhythm response → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- Tap (reaction time — single touch, timed)
- Hold (posture — sustained press, duration measured)
- Rhythm tap (repeated taps, timing measured against beat)
- Sequence tap (ordered taps on different screen zones)
- Force-sensitive tap (if device supports — pressure as proxy for "power"; fallback: tap duration)

### Timing requirements
- **Critical:** Millisecond-precision timing for RT measurement
- Input latency must be characterised and compensated (device-specific calibration)
- Audio-visual synchronisation critical for rhythm tasks (< 20ms A/V offset)
- Frame-rate independence required (timing not tied to render loop)

### NPC/AI requirements
- Forge-Master NPC: provides instruction, feedback, narrative framing
- Training Partner NPC: provides synchronisation target for paired drills
- Recruit NPC: receives demonstrations for teaching drills
- Benchmark NPCs: provide competitive comparison (not real players — calibrated to population norms)

### LLM requirements
- **Low:** Minimal LLM involvement — this modality is primarily algorithmic
- Generates Forge-Master dialogue (encouragement, correction, narrative)
- Adapts framing based on shadow state (different language for different shadows)
- Not involved in scoring or difficulty adaptation

### State persistence
- RT history (running median, trend, best)
- Rhythm accuracy history (mean asynchrony, tempo range, consistency)
- Hold duration history (max, trend, interference tolerance)
- Sequence accuracy history (length achieved, timing quality)
- Drive-health signals (competitive response, synchronisation, advancement patterns)
- Shadow signals (rest-phase behaviour, engagement quality, force-precision ratio, structure response)
- Fatigue state (accumulated somatic load this session and across sessions)
- Checkpoint position and phase
