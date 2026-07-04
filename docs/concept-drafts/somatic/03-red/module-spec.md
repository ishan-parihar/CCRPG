# Somatic / Red — Module Specification

> **The Vibration:** The power-body. The body as weapon, as assertion, as dominance-instrument. "I AM this body and this body CONQUERS." Not yet disciplined (Amber), not yet skilled (Orange), not yet listening (Green) — but genuinely powerful: fast, strong, rhythmic, and PRESENT in the flesh.

---

## 1. Capacity Definition

Somatic/Red is the emergence of **body-as-power-instrument**. The player can:
- React to stimuli within a tight window (simple RT ≤ 350ms, choice RT ≤ 500ms)
- Sustain a held input (posture) for 3-5 seconds under interference
- Synchronise tapping to a beat at moderate tempos (80-120 BPM, ±50ms tolerance)
- Execute 2-action motor sequences (strike-dodge, dodge-strike) with correct ordering
- Detect and respond to body-state signals at a gross level (tension vs. relaxation)

**Healthy expression:** Uses the body with confidence and pleasure. Reacts quickly without recklessness. Holds posture when it serves. Moves rhythmically with natural timing. Accepts physical limits without shame. Uses power for assertion not predation. Inhabits the body fully — no dissociation, no over-identification.

---

## 2. Shadow Archetypes

### Dark-Addiction: "The Compulsive Mover"
The body cannot stop. Movement avoids inner states. Reacts to EVERYTHING physically. Developmental origin: hypervigilant household or athletic identity as sole self-worth. Manifests as: commission errors on Go/No-Go, fidgeting during holds, rushed rhythm, fast-but-sloppy sequences, intolerance of rest phases.

### Dark-Allergy: "The Disembodied"
The body is rejected, numbed, or abandoned. Lives "above the neck." Developmental origin: body-shaming, physical trauma creating dissociation, or intellectual household. Manifests as: slow RT from disengagement, posture drift/collapse, absent or mechanical rhythm, physically flat sequences, avoidance of physical modalities.

### Golden-Addiction: "The Premature Disciplinarian"
Imposes Amber-level form before Red-level power exists. Bypasses raw physicality for "correct" movement. All form, no fire. Developmental origin: raw physicality punished or premature disciplined movement exposure. Manifests as: precise but WEAK reactions, rigid posture holds, metronomic rhythm without groove, correct but powerless sequences.

### Golden-Allergy: "The Structure-Refuser"
Refuses physical discipline or externally-imposed form. Freedom confused with chaos. Developmental origin: abusive physical discipline or repeated "correction" of natural movement. Manifests as: good raw capacity but REFUSES structured challenges, ignores external rhythm, resists sequences, abandons holds from refusal not inability.

---

## 3. Drive-Health Landscape

| Drive | Dark-Domain (submergent health) | Golden-Domain (emergent health) |
|---|---|---|
| **Agency** | Physical sovereignty without domination — chooses WHEN to be fast/still/powerful | Physical initiative without dependence — begins new movement without needing permission |
| **Communion** | Physical joining without self-loss — synchronises without losing own centre | Physical empathy without isolation — mirrors and matches with genuine attunement |
| **Eros** | Physical satisfaction without stagnation — enjoys current capacity without compulsive advancement | Physical aspiration without bypass — reaches toward new capacity without skipping foundations |
| **Agape** | Physical honouring without regression — returns to basics without dismissing them | Physical embodiment without compartmentalisation — transfers somatic awareness to all life contexts |

---

## 4. Healing Vectors

### Heal/Evolve (Agape + Agency) — for dark shadows

**Dark-Addiction:** Return to the body's NEED for rest. Choose stillness sovereignly. Games introduce rest-phases that are REWARDED — stillness produces power. Resolution: can be still without distress AND move with purpose.

**Dark-Allergy:** Return to the body's basic aliveness. Choose to inhabit the body. Games introduce minimal physical engagement with maximum reward. Resolution: engages physical tasks without avoidance AND reports body-state accurately.

### Evolve/Heal (Eros + Communion) — for golden shadows

**Golden-Addiction:** Reach toward POWER before form. Join with the raw, messy, alive body. Games reward FORCE over precision at early stages. Resolution: can move with raw force AND accept imprecision.

**Golden-Allergy:** Reach toward structure as LIBERATION. Join with the rhythm/form/pattern. Games introduce structure as OPTIONAL and REWARDING. Resolution: can follow external structure without rebellion AND maintain own identity within it.

---

## 5. Scoring Parameters

### Core Tasks & Thresholds

| Task | Pass | Ceiling | Staircase |
|---|---|---|---|
| Simple RT | ≤ 350ms | ≤ 250ms | ISI jitter reduction |
| Choice RT | ≤ 500ms (2-choice) | ≤ 380ms (4-choice) | Choice-count increase |
| Posture Hold | ≥ 3s mild interference | ≥ 6s strong interference | Interference escalation |
| Rhythm Sync | ±50ms at 100 BPM | ±25ms at 80-140 BPM | Tempo variation + tightening |
| Motor Sequencing | 2-action ≥ 80% | 3-action ≥ 80% | Sequence length increase |

### Capacity Score Computation
```
capacity_score = weighted_mean([
  rt_score(simple_rt, 350, 250),           // 0.20
  rt_score(choice_rt, 500, 380),           // 0.20
  hold_score(posture, 3, 6),              // 0.20
  rhythm_score(asynchrony, 50, 25),       // 0.25
  sequence_score(accuracy, 0.80, 0.95),   // 0.15
])
```

### Shadow Resolution Thresholds
- **Dark-Addiction:** Stillness tolerance ≥ 5s without compensatory movement; selective reaction rate ≥ 70%
- **Dark-Allergy:** Engagement rate ≥ 80%; body-state accuracy ≥ 60%; RT within 1.5× population median
- **Golden-Addiction:** Power-expression quality ≥ 0.6 before form-imposition
- **Golden-Allergy:** Structured-task engagement ≥ 70%; external-rhythm synchronisation within tolerance

### Theta-Decay
- Half-life: 14 days | Max decay: 35% | Recovery: 1-3 sessions | Floor: 0.40

### Checkpoint Progression
- Phase 1 (CP 1-5): Basic capacity stabilising, shadow surfacing
- Phase 2 (CP 5-20): Capacity deepening, drive patterns confirmed, healing engaging
- Phase 3 (CP 20-50): Integration progressing, cross-modality transfer visible
- Phase 4 (CP 50+): Approaching ceilings, shadows resolving, early Amber signals

---

## 6. Compound Shadows & Cross-Module Relationships

### Modules that SUPPORT this one
- **Willpower/Red:** Burst-will enables sustained physical effort under fatigue
- **Cognitive/Red:** 2-step planning enables motor sequencing
- **Intrapersonal/Red:** Basic self-awareness enables body-state detection

### Modules this one SUPPORTS
- **Cognitive/Red:** Embodied cognition grounds abstract thinking
- **Emotional/Red:** Body-state awareness is foundation of emotion detection
- **Willpower/Red:** Physical stamina is substrate of volitional endurance
- **Interpersonal/Red:** Physical presence enables social assertion

### Compound Shadow Patterns
| Pattern | Modules | Dynamic |
|---|---|---|
| "Lives in the head" | Somatic dark-allergy + Cognitive dark-addiction | Thinking feeds body-avoidance |
| "All action, no direction" | Somatic dark-addiction + Willpower dark-allergy | Movement masks volitional collapse |
| "Disciplined body, numb heart" | Somatic golden-addiction + Emotional dark-allergy | Form avoids feeling |
| "The Ghost" | Somatic dark-allergy + Interpersonal dark-allergy | Neither physically nor socially present |

### Bidirectional Reinforcement Loops
| Loop | Break point |
|---|---|
| Head-living (Cognitive/dark-addiction ↔ Somatic/dark-allergy) | Either module's healing breaks it |
| Action-without-direction (Somatic/dark-addiction ↔ Willpower/dark-allergy) | Willpower healing gives direction |
| Numb-discipline (Somatic/golden-addiction ↔ Emotional/dark-allergy) | Emotional healing brings feeling into form |
| Ghost (Somatic/dark-allergy ↔ Interpersonal/dark-allergy) | Somatic healing creates physical presence |

---

## 7. Shadow Surfacing Sequence

### Conditions Each Game Must Create
1. **Stillness is possible** → surfaces dark-addiction (can they stop?)
2. **Physical engagement is required** → surfaces dark-allergy (will they inhabit the body?)
3. **Raw power is valued over precision** → surfaces golden-addiction (can they be messy?)
4. **Structure is introduced** → surfaces golden-allergy (can they accept form?)

### Within-Session Surfacing Sequence

| Phase | What surfaces | How |
|---|---|---|
| Opening (warm-up) | Dark-allergy | Does the player engage physically or resist? |
| Intensity phase | Dark-addiction | Does the player escalate compulsively or modulate? |
| Precision phase | Golden-addiction | Does the player impose form prematurely? |
| Structure phase | Golden-allergy | Does the player accept external rhythm/form? |
| Rest phase | Dark-addiction (again) | Can the player stop? |

### Detection Signals

| Signal | Shadow | Threshold |
|---|---|---|
| Commission errors > 35% on Go/No-Go | Dark-addiction | 3+ sessions |
| Fidget rate > 2/second during holds | Dark-addiction | 3+ sessions |
| RT > 1.5× population median | Dark-allergy | 3+ sessions |
| No synchronisation attempt | Dark-allergy | 2+ sessions |
| High accuracy + low force | Golden-addiction | 5+ sessions |
| Zero-variance rhythm (metronomic) | Golden-addiction | 3+ sessions |
| Performance collapse on structured tasks only | Golden-allergy | 3+ sessions |
| External rhythm rejection | Golden-allergy | 3+ sessions |

### Cross-Session Pattern Signals
| Pattern | Shadow | Window |
|---|---|---|
| Increasing RT on rest-phase tasks | Dark-addiction worsening | 5+ sessions |
| Decreasing physical modality engagement | Dark-allergy deepening | 5+ sessions |
| Increasing precision with decreasing force | Golden-addiction solidifying | 7+ sessions |
| Increasing avoidance of structured challenges | Golden-allergy solidifying | 5+ sessions |
| Physical modality preference > 80% | Dark-addiction (body as escape) | 10+ sessions |
| Physical modality avoidance > 80% | Dark-allergy (body as threat) | 10+ sessions |
