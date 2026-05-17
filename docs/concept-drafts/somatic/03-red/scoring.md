# Somatic / Red — Scoring Skeleton

> **The Vibration:** The power-body. The body as weapon, as assertion, as dominance-instrument. "I AM this body and this body CONQUERS." Not yet disciplined (Amber), not yet skilled (Orange), not yet listening (Green) — but genuinely powerful: fast, strong, rhythmic, and PRESENT in the flesh. The body is not a vehicle for the mind; the body IS the self at Red.

---

## 1. The Vibration

### 1.1 What IS this capacity?

Somatic/Red is the emergence of **body-as-power-instrument**. The player can:
- React to stimuli within a tight window (simple RT ≤ 350ms, choice RT ≤ 500ms)
- Sustain a held input (posture) for 3-5 seconds under interference
- Synchronise tapping to a beat at moderate tempos (80-120 BPM, ±50ms tolerance)
- Execute 2-action motor sequences (strike-dodge, dodge-strike) with correct ordering
- Detect and respond to body-state signals at a gross level (tension vs. relaxation)

The somatic structure is **powerful but undisciplined**. The player has genuine physical capacity — speed, timing, force — but cannot yet sustain it (Amber), refine it (Orange), or listen to its subtleties (Green). The body is a blunt instrument wielded with confidence.

### 1.2 What does HEALTHY look like?

A healthy Somatic/Red expression:
- Uses the body with confidence and pleasure — "I ENJOY being physical"
- Reacts quickly without recklessness (speed serves a goal, not just impulse)
- Can hold a posture/stance when it serves them (not just when forced)
- Moves rhythmically with natural timing — not mechanical, not chaotic
- Accepts physical limits without shame (fatigue is information, not failure)
- Uses physical power for assertion (boundary-setting) not predation (domination)
- Inhabits the body fully — no dissociation, no numbness, no over-identification

### 1.3 What does PATHOLOGICAL look like?

| Shadow quadrant | Somatic/Red expression |
|---|---|
| **Dark-Addiction** | Compulsive physicality. Cannot stop moving. Uses body to avoid feeling/thinking. "If I keep moving, nothing can touch me." Hyper-reactive — responds to EVERYTHING physically. Cannot be still. Treats the body as the ONLY self. |
| **Dark-Allergy** | Body-rejection. "The body is stupid/weak/disgusting." Dissociation from physical sensation. Cannot feel tension, fatigue, or pleasure. Refuses physical engagement. Lives entirely "in the head." The body is an inconvenience. |
| **Golden-Addiction** | Premature discipline. Tries to impose Amber-level form (kata, precise technique) without Red-level power-foundation. Bypasses raw physicality for "correct" movement. Performs technique without force. All form, no fire. |
| **Golden-Allergy** | Terror of discipline. Refuses any structure in movement. "Don't tell me HOW to move." Actively avoids situations that would develop coordinated form. Treats discipline as imprisonment. Desacralises the body's capacity for refinement. |

---

## 2. Capacity Scoring

### 2.1 Core tasks and thresholds

| Task | Pass threshold | Ceiling | Staircase parameter |
|---|---|---|---|
| **Simple Reaction Time** | Median RT ≤ 350ms (visual stimulus) | Median RT ≤ 250ms | ISI jitter reduction |
| **Choice Reaction Time** | Median RT ≤ 500ms (2-choice) | Median RT ≤ 380ms at 4-choice | Choice-count increase |
| **Held Input (Posture)** | Hold ≥ 3s under mild interference | Hold ≥ 6s under strong interference | Interference intensity increase |
| **Rhythm Synchronisation** | Mean asynchrony ≤ ±50ms at 100 BPM | Mean asynchrony ≤ ±25ms at 80-140 BPM range | Tempo variation + tolerance tightening |
| **Motor Sequencing** | 2-action sequences correct ≥ 80% | 3-action sequences correct ≥ 80% | Sequence length increase |

### 2.2 Capacity score computation

```
capacity_score = weighted_mean([
  rt_score(simple_rt, 350, 250),              // weight: 0.20
  rt_score(choice_rt, 500, 380),              // weight: 0.20
  hold_score(posture_duration, 3, 6),         // weight: 0.20
  rhythm_score(mean_asynchrony, 50, 25),      // weight: 0.25
  sequence_score(accuracy, 0.80, 0.95),       // weight: 0.15
])

where:
  rt_score(actual, threshold, ceiling) = clamp((threshold - actual) / (threshold - ceiling), 0, 1)
  hold_score(actual, threshold, ceiling) = clamp((actual - threshold) / (ceiling - threshold), 0, 1)
  rhythm_score(actual, threshold, ceiling) = clamp((threshold - actual) / (threshold - ceiling), 0, 1)
  sequence_score(actual, threshold, ceiling) = clamp((actual - threshold) / (ceiling - threshold), 0, 1)
```

### 2.3 Staircase mechanics

- **Simple RT:** Inter-stimulus interval jitter narrows (less predictable timing)
- **Choice RT:** Number of choices increases (2 → 3 → 4); stimulus-response mapping complexity increases
- **Posture hold:** Interference type escalates (visual distractors → auditory → dual-task)
- **Rhythm sync:** Tempo range widens; tolerance tightens; off-beat distractors introduced
- **Motor sequencing:** Sequence length increases (2 → 3 → 4); timing constraints added

---

## 3. Drive-Health Scoring (4 drives × 2 domains = 8 scores)

### Agency Dark-Domain
- **Healthy:** Uses physical power with sovereignty — chooses WHEN to be fast, WHEN to hold, WHEN to strike. Physical capacity serves chosen goals.
- **Pathological:** Physical dominance as compulsion. Must be the fastest, the strongest. Cannot let another be physically superior. Reacts to EVERY stimulus because not-reacting feels like weakness.
- **Measurement:** Ratio of purposeful reactions to indiscriminate reactions; whether speed serves a goal or is an end in itself; response to being physically outperformed.

### Agency Golden-Domain
- **Healthy:** Engages novel physical challenges with confidence. "I can learn this new movement." Explores unfamiliar body-states without needing external validation.
- **Pathological:** Cannot initiate physical engagement without instruction. "Show me how first." Paralysis before novel movement challenges. Needs permission to move.
- **Measurement:** Time-to-first-action on novel physical tasks; quality of self-initiated movement exploration; willingness to attempt without demonstration.

### Communion Dark-Domain
- **Healthy:** Can synchronise with another (rhythm matching, coordinated movement) while maintaining own timing centre. Joins without losing self.
- **Pathological:** Loses own rhythm entirely when synchronising. Becomes the other's body. Cannot maintain physical identity in coordinated movement. Over-adapts.
- **Measurement:** Whether synchronisation preserves player's baseline timing characteristics; quality of return to own rhythm after coordination.

### Communion Golden-Domain
- **Healthy:** Can mirror, match, and move WITH others. Physical empathy — the body responds to others' movement naturally.
- **Pathological:** Cannot mirror. Physical isolation. The body does not respond to others' movement at all. Or: performs mirroring mechanically without genuine attunement.
- **Measurement:** Quality of spontaneous movement matching; whether mirroring is mechanical or organic; physical responsiveness to others' states.

### Eros Dark-Domain
- **Healthy:** Enjoys current physical capacity. Can rest in the body's current power without needing MORE. Satisfaction in what the body CAN do.
- **Pathological:** Cannot rest in current capacity. Compulsive advancement. "I need to be faster/stronger/better NOW." Treats current body as insufficient. Chronic dissatisfaction with physical self.
- **Measurement:** Satisfaction signals at current difficulty; whether advancement is chosen or compulsive; engagement quality at mastered levels.

### Eros Golden-Domain
- **Healthy:** Reaches toward new physical capacity with curiosity. Attempts harder challenges. Tolerates the awkwardness of learning new movement.
- **Pathological:** Claims physical mastery without demonstration. Performs advanced movement poorly and calls it success. Bypasses the learning phase. "I already know how to do that."
- **Measurement:** Gap between attempted difficulty and demonstrated capacity; quality of engagement with learning-phase awkwardness; honesty about physical limits.

### Agape Dark-Domain
- **Healthy:** Returns to basic physical practices (simple reactions, basic rhythm) with full presence. Honours the foundation. Doesn't dismiss simple movement.
- **Pathological:** Dismisses basic physicality. "That's too easy." Executes simple tasks carelessly. Cannot honour the body's foundational capacities.
- **Measurement:** Execution quality on below-level tasks; attention signals during basic physical engagement; whether simple movement receives full presence.

### Agape Golden-Domain
- **Healthy:** Physical capacity transfers to daily life. The body is inhabited OUTSIDE the game. Movement quality appears in non-game contexts (posture, breath, presence).
- **Pathological:** Physical engagement exists only in game context. Outside the game, the body is abandoned. No transfer of somatic awareness to lived experience.
- **Measurement:** Self-reported body-awareness between sessions; quality of initial-session body-state; whether somatic gains persist across time gaps.

---

## 4. Shadow Integration Scoring (4 quadrants)

### Dark-Addiction: "The Compulsive Mover"
**Resolved when:**
- Can be physically STILL without distress (holds posture without fidgeting)
- Reacts only to relevant stimuli (not everything that moves)
- Physical engagement serves goals rather than avoiding inner states
- Can tolerate physical inactivity without anxiety
- **Threshold:** Stillness tolerance ≥ 5s without compensatory movement; selective reaction rate ≥ 70%

### Dark-Allergy: "The Disembodied"
**Resolved when:**
- Engages physical tasks without avoidance or disgust
- Can report basic body-state (tense/relaxed, fast/slow) accurately
- Reaction times are within normal range (not artificially slow from disengagement)
- Physical challenges are approached rather than avoided
- **Threshold:** Engagement rate ≥ 80% on physical tasks; body-state accuracy ≥ 60%; RT within 1.5× population median

### Golden-Addiction: "The Premature Disciplinarian"
**Resolved when:**
- Can move with RAW POWER before imposing form
- Accepts that force precedes technique developmentally
- Engages Red-level physicality (speed, strength, rhythm) without immediately trying to refine it
- Can be "messy" in movement without distress
- **Threshold:** Power-expression quality ≥ 0.6 before form-imposition; tolerance of imprecise-but-powerful movement

### Golden-Allergy: "The Structure-Refuser"
**Resolved when:**
- Can accept physical instruction without rebellion
- Engages with structured movement (sequences, patterns) without treating it as imprisonment
- Tolerates the constraint of form when it serves development
- Can follow a rhythm imposed from outside (not just self-generated)
- **Threshold:** Structured-task engagement ≥ 70%; external-rhythm synchronisation within tolerance; instruction-following without performance collapse

---

## 5. Checkpoint Progression Rubric

### Phase 1: Early Engagement (Checkpoints 1-5)
- Simple RT stabilising below 350ms
- Basic rhythm sync emerging (±50ms at comfortable tempo)
- Posture hold reaching 3s
- 2-action sequences attempted
- Drive landscape becoming visible (which drives are healthy/pathological)
- Shadow quadrant beginning to surface

### Phase 2: Deepening (Checkpoints 5-20)
- Choice RT improving (approaching 4-choice)
- Rhythm range expanding (80-120 BPM)
- Posture hold under interference
- Motor sequences becoming reliable
- Drive-health patterns stabilising (consistent signals across sessions)
- Shadow patterns confirmed (repeated signals, not one-off)
- Healing mechanics beginning to engage

### Phase 3: Integration (Checkpoints 20-50)
- All capacity tasks at or above threshold
- Drive-health improving (pathological patterns reducing)
- Shadow integration progressing (resolution criteria partially met)
- Cross-modality transfer visible (somatic capacity appearing in other game contexts)
- Physical engagement becoming intrinsically motivated

### Phase 4: Evolution (Checkpoints 50+)
- Capacity approaching ceilings
- Drive-health balanced across all 8 domains
- Shadow integration substantially complete
- Spontaneous physical engagement in non-somatic game contexts
- Early Amber-level signals emerging (sustained form, discipline tolerance)
- Ready for stage-advancement assessment

---

## 6. Theta-Decay Parameters

- **Decay sensitivity:** HIGH — somatic capacity degrades faster than cognitive with disuse. The body forgets quickly.
- **Half-life:** 14 days (faster than cognitive's 21 days)
- **Maximum decay:** 35% (more than cognitive's 25% — physical skills are more use-dependent)
- **Recovery rate:** FAST — somatic capacity recovers quickly with re-engagement (1-3 sessions to restore)
- **Minimum floor:** 0.40 (the body retains basic reactivity even with neglect)
- **Rationale:** Physical skills are highly practice-dependent. A week without physical engagement produces measurable RT degradation. But the body also recovers quickly — "muscle memory" is real.

---

## 7. Cross-Module Dependencies

### Modules that SUPPORT this one
- **Willpower/Red:** Burst-will enables sustained physical effort. Without willpower, somatic capacity cannot be deployed under fatigue.
- **Cognitive/Red:** 2-step planning enables motor sequencing. Without cognitive sequencing, complex movement patterns cannot be learned.
- **Intrapersonal/Red:** Basic self-awareness enables body-state detection. Without "I am tense," somatic regulation cannot begin.

### Modules that this one SUPPORTS
- **Cognitive/Red:** Embodied cognition — the body grounds abstract thinking. Somatic health improves cognitive task performance (arousal regulation).
- **Emotional/Red:** Body-state awareness is the foundation of emotion detection. "I feel my fists clench" precedes "I am angry."
- **Willpower/Red:** Physical stamina is the substrate of volitional endurance. Somatic capacity enables willpower expression.
- **Interpersonal/Red:** Physical presence enables social assertion. The body that can hold space enables the self that can hold boundaries.

### Compound shadow patterns
- **Somatic/Red/dark-allergy + Cognitive/Red/dark-addiction:** "Lives in the head" — dissociated from body, over-identified with thinking. The cognitive compulsion FEEDS the somatic avoidance.
- **Somatic/Red/dark-addiction + Willpower/Red/dark-allergy:** "All action, no direction" — compulsive movement without purpose. Physical hyperactivity masks volitional collapse.
- **Somatic/Red/golden-addiction + Emotional/Red/dark-allergy:** "Disciplined body, numb heart" — premature physical refinement used to avoid emotional engagement. Form without feeling.
- **Somatic/Red/dark-allergy + Interpersonal/Red/dark-allergy:** "The Ghost" — neither physically present nor socially engaged. Invisible. Cannot assert because cannot inhabit the body that would assert.
