# Somatic / Amber — Immersive-RPG

> **Axis:** The immersive-rpg (ecological) axis probes somatic intelligence through SPONTANEOUS DISCIPLINED MOVEMENT in an open world — not structured body-tasks but free embodied behaviour. How does the player's body relate to discipline when nobody's saying "hold the stance"?
>
> **Why this axis:** The other 6 modalities probe somatic capacity through structured challenges. This one observes it in the wild. The world is EMBODIED — monasteries with movement rituals, dojos with open practice, processions through streets, rhythmic environments. Spontaneous engagement reveals genuine somatic intelligence.

---

## §1 Game Identity

- **Title:** "The Embodied World"
- **Core mechanic:** An open Amber-stage world saturated with embodied-discipline content. Dojos with open practice. Processions to join. Rhythmic environments. Breath-gated passages. The player's spontaneous engagement with disciplined movement — how they inhabit a body-honouring world without being prompted — reveals genuine somatic intelligence.
- **Duration:** 5-15 minutes per session (infinite checkpoints; fatigue-aware; player-determined)
- **Internal progression:** Body-Noticing → Body-Joining → Body-Sustaining → Body-Adapting → The Living Body

---

## §2 Catalyst Delivery

**What it uniquely presents:** An ECOLOGICAL context — embodied-discipline content embedded in a living world, not presented as tasks.

**How it differs from other 6:** Only modality with NO EXPLICIT TASKS. The world contains body-content; the player's NATURAL engagement is the data. Tests whether somatic intelligence is genuine (spontaneous) or performative (only when prompted).

**What it uniquely surfaces:** Dark-addiction as compulsive over-engagement (enters every dojo, joins every procession). Dark-allergy as ignoring all body-content (world is just terrain). Golden-addiction as advanced-only engagement (skips basics). Golden-allergy as familiar-only engagement (avoids novel body-content).

**Successful integration:** The player demonstrates somatic intelligence SPONTANEOUSLY — holding, synchronising, breathing, and adapting within embodied environments without being prompted.

---

## §3 Game Design

### Setup
An open Amber-stage world saturated with embodied-discipline content. Dojos with open practice. Processions through streets. Breath-gated passages. Rhythmic environments. Posture-locked doors. Every zone has body-honouring content — opportunities to hold, synchronise, breathe, and move with discipline.

### Interaction Phases
- **Free navigation:** Moving through an embodied world
- **Spontaneous body-engagement:** Entering dojos, joining processions, holding stances
- **Body-gated content:** Passages requiring somatic capacity (breath-gates, posture-locks)
- **Group movement:** Processions and communal practice to join
- **Rhythmic environments:** Zones with pulse that the body can match

### Feedback
- Natural consequences: body-engagement → gated access, procession rewards, rhythmic bonuses
- Natural consequences: no engagement → missed content, stuck paths, incomplete world
- No explicit "somatic score" — the world IS the feedback

### Difficulty Adaptation
- Embodied content density scales with demonstrated engagement
- Body-gate complexity scales with demonstrated capacity
- Procession complexity scales with demonstrated synchrony
- Rhythmic environment tempo scales with demonstrated timing
- Novel body-content appears as capacity grows

### Progression Table
| Phase | Checkpoints | What changes |
|---|---|---|
| Body-Noticing | 1-5 | Does the player notice embodied content? |
| Body-Joining | 5-15 | Do they engage body-challenges they encounter? |
| Body-Sustaining | 15-30 | Can they sustain embodied engagement over time? |
| Body-Adapting | 30-50 | Can they adapt to novel embodied content? |
| The Living Body | 50+ | Full ecological somatic intelligence |

---

## §4 Item Pool

| Type | Pool size |
|---|---|
| Dojos (open practice spaces to enter and engage) | 20+ |
| Processions (group movements to join and synchronise) | 15+ |
| Breath-gates (passages requiring breath-capacity) | 15+ |
| Posture-locks (doors requiring sustained holds) | 10+ |
| Rhythmic zones (environments with pulse to match) | 10+ |

---

## §5 Technical Requirements

- **Inputs:** Navigation (exploration); hold (posture-locks); rhythm-tap (rhythmic zones); breath-tap (breath-gates); sequence-tap (dojo practice)
- **Timing:** Session-level tracking (engagement patterns, body-challenge success); millisecond precision for synchrony in rhythmic zones; breath-rate tracking for breath-gates
- **NPC/AI:** Embodied environment (body-content throughout world); procession system (group movements to join); breath-gate system (calibrated to player's breath-rate); posture-lock system; rhythmic zone system (environments with pulse)
- **LLM level:** Medium-High — world generation, ecological assessment, NPC interactions within embodied spaces; detects spontaneous somatic engagement from behaviour patterns; evaluates somatic intelligence without explicit tasks; generates responsive content based on demonstrated capacity
- **State persistence:** Full world state; embodied engagement history; navigation patterns; body-gate success records; procession participation; rhythmic attunement metrics; drive/shadow signals; fatigue state; checkpoint position
