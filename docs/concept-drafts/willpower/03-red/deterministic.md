# Willpower / Red — Deterministic Game Concept

> **Axis:** The deterministic axis probes willpower capacity through OBJECTIVE, MEASURABLE volitional tasks — sustained effort duration, temptation resistance accuracy, goal-completion rate. No interpretation needed. The numbers tell the story. This modality accesses the RAW PERFORMANCE dimension of will: can you DO what you said you would?
>
> **Why this axis for Willpower/Red:** Willpower at Red is concrete and measurable: How long can you sustain effort? How many temptations can you resist? Do you finish what you start? The deterministic axis strips away narrative and measures the will directly — like a dynamometer for volitional force.

---

## 1. Game Identity

- **Title:** "The Vow-Forge"
- **Core mechanic:** The player declares goals, sustains effort under distraction, resists temptations, and completes declared objectives — with millisecond-precision measurement of volitional persistence, temptation-resistance latency, and goal-delivery rate.
- **Duration:** 3-6 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Goal Ignition → Sustained Burns → Temptation Gauntlet → Fatigue Mastery → The Unbreakable Vow

---

## 2. Catalyst Delivery

**Catalyst:** The game presents a concrete goal and says: "Do this. Don't stop. Don't be distracted." The contact boundary is: "Can your will hold for 15 seconds against competing demands?" Pure volitional challenge — no cognitive complexity, no emotional nuance, just RAW WILL.

**Unconscious response:**
- *Submergent:* The player's volitional structure surfaces immediately. Can they commit? Can they sustain? Can they resist? Can they rest? The deterministic format leaves nowhere to hide — the numbers reveal the will's true state.
- *Emergent:* The pull toward longer, stronger, more resilient will. Can they hold 5 more seconds? Can they resist one more temptation?

**Integration path:** The game rewards COMPLETED GOALS with visible power. Every finished vow = strength gained. Every broken vow = neutral (not punished, but no power gained). The will learns: completion IS power.

**Successful integration:** The player demonstrates stable burst-will — can declare, sustain (15-60s), resist (1-3 temptations), and complete goals at ≥50% rate, with voluntary rest between bursts.

---

## 3. Game Design

### Setup
The Vow-Forge: a ritual space where warriors temper their will. The player stands before the forge-fire and declares vows — then must HOLD them against wind, distraction, temptation, and fatigue. The aesthetic: Red-stage forge, iron and fire, the sound of hammering, heat-shimmer. The Forge-Master NPC observes and occasionally speaks.

### Interaction
- **Goal Ignition:** Player declares (or selects) a goal. "I will hold for 20 seconds." "I will resist 3 temptations." "I will complete this sequence."
- **Sustained Burns:** Hold a button/tap continuously for the declared duration. Distractors appear (visual noise, competing targets, false endpoints). The will must HOLD.
- **Temptation Gauntlet:** During sustained effort, temptations appear (smaller-sooner rewards: "Take this small power NOW and end the trial"). Resist = continue toward larger-later reward.
- **Fatigue Mastery:** As effort continues, the task gets harder (button requires more force, distractors intensify). The player must recognise optimal stop-point vs. pushing past it.
- **The Unbreakable Vow:** Combined challenge — declare, sustain, resist, complete — at maximum demonstrated capacity.

### Feedback
- Goal completed → forge-fire flares; power gained; Forge-Master nods: "Vow kept."
- Goal abandoned → forge-fire dims; neutral: "The vow breaks. No shame. Try again."
- Temptation resisted → visible temptation shatters; "Your will is iron."
- Temptation taken → smaller reward gained; "You chose the lesser. It is what it is."
- Optimal rest → forge-fire builds during rest; "The blade cools. It will strike harder."

### Difficulty Adaptation
- Sustain duration: 10s → 15s → 20s → 30s → 45s → 60s
- Temptation count: 0 → 1 → 2 → 3 → 4
- Temptation attractiveness: low → medium → high (reward differential)
- Distractor intensity: minimal → moderate → heavy
- Goal complexity: single-dimension → multi-dimension (sustain + resist simultaneously)

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Goal Ignition | 1-5 | Simple declarations; 10-15s sustain; no temptations; generous timing |
| Sustained Burns | 5-15 | 15-25s sustain; mild distractors; 1 temptation per trial |
| Temptation Gauntlet | 15-30 | 20-30s sustain; moderate distractors; 2-3 temptations; delay-of-gratification scoring |
| Fatigue Mastery | 30-50 | 30-45s sustain; heavy distractors; fatigue recognition; optimal stop-point scoring |
| The Unbreakable Vow | 50+ | Full combined challenges; 45-60s; 3-4 temptations; fatigue mastery; self-set goals |

---

## 4. Item Pool

### Item types
- **Goal templates:** Specific vow-types (duration holds, temptation resistance, completion targets)
- **Distractor configurations:** Visual/auditory interference patterns during sustained effort
- **Temptation offers:** Smaller-sooner rewards with varied attractiveness
- **Fatigue curves:** Different effort-decay profiles requiring different stop-points
- **Combined challenges:** Multi-dimension vows (sustain + resist + complete)

### Minimum pool size
- 20+ goal templates per difficulty level (duration × temptation × distractor combinations)
- 30+ distractor configurations (visual, auditory, tactile interference)
- 25+ temptation offers (varied reward sizes, varied timing within trial)
- 15+ fatigue curves (linear, exponential, stepped decay profiles)
- 10+ combined challenges (multi-dimension vows)

### Generation rules
- Goals generated from duration × temptation × distractor parameters
- Difficulty = composite of all three dimensions
- Temptation attractiveness calibrated to player's demonstrated resistance threshold
- Fatigue curves calibrated to player's demonstrated endurance
- All goals must be ACHIEVABLE at the player's current capacity (no impossible vows)

### Drive/shadow mapping
- Suggested vs. self-set goal choice → Agency probing
- Shared-goal effort maintenance → Communion probing
- Post-completion rest vs. re-engage → Eros probing
- Foundation-goal effort quality → Agape probing
- Rest-skip rate → dark-addiction signal
- Early abandonment rate → dark-allergy signal
- Effort moderation on burst-tasks → golden-addiction signal
- Duration-threshold cliff → golden-allergy signal

---

## 5. Technical Requirements

### Input types
- Sustained hold (press and maintain for duration — primary mechanic)
- Tap-to-resist (tap away temptation offers)
- Tap-to-declare (select/confirm goal before trial)
- Release-to-rest (voluntary release during rest periods)

### Timing requirements
- **Critical:** Millisecond precision for sustain-duration measurement
- Temptation-resistance latency measured (how quickly they reject)
- Goal-declaration latency measured (how quickly they commit)
- Rest-duration measured (how long they voluntarily rest)

### NPC/AI requirements
- Forge-Master NPC: observes, comments, provides framing (not interactive)
- Ally NPC: for shared-goal rounds (has own effort pattern, can succeed/fail independently)
- Temptation-generator: produces contextually appropriate smaller-sooner offers

### LLM requirements
- **Low:** Core mechanics are algorithmic (timers, counters, thresholds)
- Generates Forge-Master dialogue adapted to player's current shadow-state
- Generates temptation narratives (contextual framing for smaller-sooner offers)
- Generates post-session summary in Red-stage warrior language

### State persistence
- Maximum sustain duration (running estimate per difficulty level)
- Temptation resistance rate (rolling average)
- Goal-completion rate (rolling average)
- Fatigue calibration accuracy (running estimate)
- Rest behaviour patterns (for shadow detection)
- Goal-selection patterns (for drive-health assessment)
- Effort intensity history (for capacity trending)
- Shadow signals (rest-skip, abandonment, moderation, cliff)
- Fatigue state (accumulated volitional load)
- Checkpoint position and phase
