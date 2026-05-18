# Somatic / Magenta — Embodied-Somatic Game Concept

> **Axis:** The embodied-somatic axis probes somatic intelligence THROUGH THE BODY ITSELF — the most direct modality for this line. At Magenta, this is body-as-magical-vessel: posture holds, breath awareness, felt-sense exploration, body-boundary discovery. The body experiencing itself.
>
> **Why this axis for Somatic/Magenta:** This is the HOME modality for the somatic line — maximum affinity. The body probing itself. At Magenta, the body is magical and alive; this game lets the player INHABIT that magic directly through physical engagement.

---

## 1. Game Identity

- **Title:** "The Body-Vessel"
- **Core mechanic:** Direct somatic engagement — the player holds postures, breathes with awareness, explores body-boundaries, and discovers felt-sense. The body as the instrument AND the subject. Pure inhabitation.
- **Duration:** 2-5 minutes per session (infinite checkpoints; fatigue-aware; body-fatigue especially monitored)
- **Internal progression:** The First Hold → The Breath → The Boundary-Feel → The Inner Landscape → The Living Vessel

---

## 2. Catalyst Delivery

**Catalyst:** "Be in your body. Hold this shape. Breathe. Feel where you end and the world begins." The contact boundary is: "Can you INHABIT your body?"

**Unconscious response:**
- *Submergent:* How does the player inhabit? The Body-Magician performs elaborate body-rituals. The Disembodied can't stay present in the body. The Premature Athlete pushes intensity. The Sensation-Refuser's body freezes or withdraws.
- *Emergent:* Can they hold gently? Breathe with awareness? Feel boundaries? Discover inner landscape?

**Integration path:** Rewards GENUINE INHABITATION — stable, gentle, aware presence in the body. Not ritual performance, not avoidance, not intensity, not fear. Just being HERE in this body.

**Successful integration:** The player inhabits their body with gentle awareness — holds stably, breathes consciously, senses boundaries, and discovers inner felt-sense.

---

## 3. Game Design

### Setup
The Body-Vessel: a direct somatic engagement space where the player inhabits their body. The aesthetic: Magenta-stage body-temple — a glowing body-outline that responds to the player's presence. When they're truly present, it glows brighter. When they drift, it dims.

### Interaction
- **The First Hold (1-5):** Hold a simple posture. Stability measured. Just be in the body.
- **The Breath (5-15):** Breathe with awareness. Breath-pace measured. Gentle, conscious breathing.
- **The Boundary-Feel (15-30):** Sense where the body ends. Proprioceptive boundary exploration.
- **The Inner Landscape (30-50):** Explore internal sensations. What's happening inside?
- **The Living Vessel (50+):** Full inhabitation — hold, breathe, sense boundaries, explore inner landscape, all with gentle awareness.

### Feedback
- Genuine presence → Body-outline glows warmly. "You're here. Your body feels you."
- Ritual performance → "Too much. Simpler. Just be here. No ceremony needed."
- Absence/drift → "You left. Come back. Your body is still here. Return to it."
- Intensity → "Softer. You're pushing. Let go of the force. Just... be."
- Freeze/withdrawal → "It's safe. Just your hands. Can you feel your hands? Start there."

### Difficulty Adaptation
- Hold duration: 3s → 5s → 8s → 12s → 20s
- Breath awareness: notice breath → pace breath → breath-body connection
- Boundary precision: gross (whole body) → moderate (limbs) → fine (digits)
- Inner landscape depth: surface (skin) → moderate (muscle) → deep (organs/core)

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Hold | 1-5 | Simple stable hold with presence |
| The Breath | 5-15 | Conscious breathing; gentle awareness |
| The Boundary-Feel | 15-30 | Proprioceptive boundary sensing |
| The Inner Landscape | 30-50 | Internal sensation exploration |
| The Living Vessel | 50+ | Full gentle inhabitation |

---

## 4. Item Pool Specification

### Item types
- **Hold postures:** Various positions with increasing duration/awareness demands
- **Breath patterns:** Various paces and awareness levels
- **Boundary explorations:** Body-zone sensing at various precisions
- **Inner landscape items:** Internal sensation discovery at various depths
- **Integration items:** Combined hold + breath + boundary + inner tasks

### Minimum pool size
- 25+ holds, 20+ breath, 15+ boundary, 15+ inner, 10+ integration

### Drive/shadow mapping
- Ritual performance → dark-addiction; attention-drift → dark-allergy
- Excessive force → golden-addiction; freeze/withdrawal → golden-allergy

---

## 5. Technical Requirements

### Input types
- Sustained touch (hold); rhythmic input (breath-pacing); tap-to-select (boundary/inner-landscape reports)

### Timing requirements
- Hold stability at ≥30Hz; breath-pace at ≥10Hz; no time pressure on awareness reports

### NPC/AI requirements
- Body-outline visualization that responds to presence/absence
- Breath-guide (visual/audio pacing)
- Optional: body-companion who models gentle inhabitation

### LLM requirements
- **Low-Medium:** Awareness-quality evaluation from verbal reports; inner-landscape interpretation. Core hold/breath metrics algorithmic.

### State persistence
- Hold stability + awareness scores; breath quality; boundary accuracy; inner-landscape access depth; gentleness metrics; ritual indicators; drift indicators; force indicators; freeze indicators; drive/shadow signals; fatigue state (CRITICAL for somatic); checkpoint position
