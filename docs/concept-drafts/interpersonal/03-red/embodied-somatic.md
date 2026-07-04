# Interpersonal / Red — Embodied-Somatic Game Concept

> **Axis:** The embodied-somatic axis probes interpersonal intelligence THROUGH THE BODY — not "can you name their intent" but "can you read their body? Can your body coordinate with theirs? Can you physically assert a boundary?" At Red, interpersonal is PHYSICAL: posture signals dominance, proximity signals intent, synchronised movement signals alliance.
>
> **Why this axis for Interpersonal/Red:** At Red, others' bodies ARE their intentions. A body leaning forward = approach. Arms crossed = closed. Moving toward you fast = threat. The embodied-somatic axis tests whether interpersonal intelligence has genuine physical grounding — reading bodies, coordinating bodies, asserting through the body.

---

## 1. Game Identity

- **Title:** "The War-Body's Eye"
- **Core mechanic:** The player reads NPC body-signals (posture, proximity, movement speed, orientation) to determine intent, coordinates physical actions with allies through timing/rhythm, and asserts boundaries through physical positioning.
- **Duration:** 3-6 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** Reading Bodies → Matching Rhythm → Physical Coordination → Body Boundaries → The War-Band's Dance

---

## 2. Catalyst Delivery

**Catalyst:** Bodies move. Bodies signal. The game asks: "What does their body tell you? Can your body move WITH theirs? Can your body say NO?" The contact boundary is: "Is your interpersonal intelligence embodied or purely cognitive?"

**Unconscious response:**
- *Submergent:* Do they read bodies at all? Do they read only threat-signals (dark-allergy)? Do they use body-reading only to dominate (dark-addiction)? Do they perform coordination without genuine physical attunement (golden-addiction)?
- *Emergent:* Can they read subtler body-signals? Coordinate with more complex rhythms? Assert boundaries physically while maintaining connection?

**Integration path:** Rewards GENUINE physical interpersonal attunement — reading bodies accurately, coordinating with physical precision, and asserting boundaries through body-positioning rather than just words.

**Successful integration:** The player reads others' body-signals accurately, coordinates physical actions with allies through timing, and asserts physical boundaries without aggression or withdrawal.

---

## 3. Game Design

### Setup
The War-Body's Eye: a training ground where bodies speak. NPCs approach with physical signals; allies move in rhythms to coordinate with; boundaries must be held through positioning. The aesthetic: Red-stage sparring ground, war-dance, the physical language of the war-band.

### Interaction
- **Reading Bodies:** NPC approaches with body-signals; player identifies intent from posture/movement. (1-5)
- **Matching Rhythm:** Ally moves in a pattern; player matches the rhythm through timed input. (5-15)
- **Physical Coordination:** Player and ally execute coordinated physical actions (attack together, defend together). (15-30)
- **Body Boundaries:** NPC encroaches; player asserts physical boundary without aggression. (30-50)
- **The War-Band's Dance:** Full multi-ally physical coordination — read, match, coordinate, assert. (50+)

### Feedback
- Accurate body-reading → "You read their body true. The flesh speaks to those who listen."
- Good coordination → "Your bodies move as one. The war-band's dance is strong."
- Boundary asserted → "You held your ground. Not aggressive. Not yielding. Present."
- Domination detected → "You forced the rhythm. Can you follow one instead?"

### Difficulty Adaptation
- Signal clarity: obvious postures → subtle shifts → contradictory signals
- Rhythm complexity: simple patterns → complex → adaptive
- Coordination demand: 1 ally → 2 allies → under pressure
- Boundary challenge: gentle encroachment → aggressive → persistent

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| Reading Bodies | 1-5 | Obvious postures; single NPC; binary intent |
| Matching Rhythm | 5-15 | Simple patterns; 1 ally; generous timing |
| Physical Coordination | 15-30 | Coordinated actions; tighter timing |
| Body Boundaries | 30-50 | Boundary assertion under pressure |
| The War-Band's Dance | 50+ | Multi-ally coordination + reading + boundaries |

---

## 4. Item Pool

### Item types
- **Body-signal profiles:** NPC posture/movement configurations signalling specific intents
- **Rhythm patterns:** Ally movement patterns for coordination matching
- **Coordination sequences:** Multi-step physical actions requiring synchrony
- **Boundary scenarios:** Encroachment situations requiring physical assertion
- **War-band dances:** Complex multi-ally physical coordination challenges

### Minimum pool size
- 30+ body-signal profiles; 25+ rhythm patterns; 20+ coordination sequences; 15+ boundary scenarios; 10+ war-band dances

### Drive/shadow mapping
- Forces own rhythm → dark-addiction; maximum withdrawal → dark-allergy
- Performed without genuine attunement → golden-addiction; drops coordination early → golden-allergy

---

## 5. Technical Requirements

### Input types
- Timed tap/hold (rhythm matching); directional input (approach/withdraw/hold); force-sensitive (boundary assertion intensity)

### Timing requirements
- Rhythm-matching at ≥30Hz sampling; coordination timing within 200ms windows; boundary response timing

### NPC/AI requirements
- NPCs with defined body-signal profiles (posture → intent mapping)
- Ally NPCs with consistent rhythm patterns (learnable)
- Encroachment NPCs with escalating pressure patterns

### LLM requirements
- **Low:** Contextual framing and feedback generation. All core scoring algorithmic.

### State persistence
- Body-reading accuracy per signal type; rhythm-matching precision history; coordination quality; boundary assertion patterns; domination/withdrawal patterns; drive/shadow signals; fatigue state; checkpoint position
