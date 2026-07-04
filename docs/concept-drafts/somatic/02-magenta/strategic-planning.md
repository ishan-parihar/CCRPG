# Somatic / Magenta — Strategic-Planning Game Concept

> **Axis:** The strategic-planning axis probes somatic intelligence through BODY-SEQUENCING — can the player plan a sequence of body-actions? At Magenta, this is proto-planning: "First I hold, THEN I move." Single-step body-planning. The body learning to sequence.
>
> **Why this axis for Somatic/Magenta:** Even at Magenta's pre-operational level, the body can learn simple sequences: hold → release, tense → relax, inhale → exhale → act. This modality tests whether the player can hold a body-plan in mind and execute it — the somatic seed of all later physical coordination.

---

## 1. Game Identity

- **Title:** "The Body-Planner"
- **Core mechanic:** The player plans and executes simple body-sequences — "hold this posture, THEN move to that one." Single-step somatic planning: one body-action leads to the next. The seed of coordinated movement.
- **Duration:** 2-4 minutes per session (infinite checkpoints; fatigue-aware)
- **Internal progression:** The Single Move → The Sequence → The Timed Body → The Body-Preparation → The First Dance

---

## 2. Catalyst Delivery

**Catalyst:** "Hold this shape. When the signal comes, move to THAT shape. Can you plan your body's next move?" The contact boundary is: "Can your body plan ahead?"

**Unconscious response:**
- *Submergent:* Can the player hold a body-plan? The Body-Magician ritualises the transition. The Disembodied can't plan body-actions (body is absent). The Premature Athlete rushes through without planning. The Sensation-Refuser freezes at the transition point.
- *Emergent:* Can they hold the plan and execute smoothly? Can they prepare the body for what's next?

**Integration path:** Rewards SMOOTH PLANNED TRANSITIONS — the body moves from one state to another with preparation and awareness. Not ritual, not absence, not rushing, not freezing.

**Successful integration:** The player holds a body-plan, prepares for transition, and executes smoothly — the body sequences with awareness.

---

## 3. Game Design

### Setup
The Body-Planner: a body-sequencing space where the player plans and executes transitions between postures. The aesthetic: Magenta-stage movement-ground — glowing body-outlines showing current and target postures, with a path between them. The body learns to flow.

### Interaction
- **The Single Move (1-5):** Hold posture A → move to posture B. One transition. Smoothness measured.
- **The Sequence (5-15):** A → B → C. Two transitions. Preparation between each.
- **The Timed Body (15-30):** Transitions must happen at specific moments. Timing + smoothness.
- **The Body-Preparation (30-50):** Feel the body PREPARING before it moves. Preparation-awareness.
- **The First Dance (50+):** Full body-sequencing — smooth, timed, prepared, aware.

### Feedback
- Smooth transition → "Your body flowed. It knew where to go. Beautiful."
- Ritual transition → "Too much ceremony. Just move. The body knows how."
- Jerky transition → "Prepare. Feel your body getting ready. Then move smoothly."
- Rushed transition → "Too fast. Prepare first. Feel the readiness. Then flow."
- Frozen → "Tiny move. Almost nothing. Just shift. You can do this."

### Difficulty Adaptation
- Transition distance: minimal → moderate → large
- Sequence length: 1 → 2 → 3 transitions
- Timing demand: untimed → generous → precise
- Preparation awareness: implicit → explicit → self-reported

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Single Move | 1-5 | One transition; smoothness measured |
| The Sequence | 5-15 | Two transitions; preparation between |
| The Timed Body | 15-30 | Timed transitions; timing + smoothness |
| The Body-Preparation | 30-50 | Preparation-awareness; feel readiness |
| The First Dance | 50+ | Full body-sequencing integration |

---

## 4. Item Pool

### Item types
- **Single transitions:** A → B posture changes
- **Sequences:** A → B → C multi-posture flows
- **Timed transitions:** Transitions at specific moments
- **Preparation items:** Focus on pre-movement awareness
- **Flow items:** Continuous smooth movement sequences

### Minimum pool size
- 25+ single, 20+ sequences, 15+ timed, 15+ preparation, 10+ flow

### Drive/shadow mapping
- Ritual transitions → dark-addiction; jerky/unplanned → dark-allergy
- Rushed/no-preparation → golden-addiction; frozen at transition → golden-allergy

---

## 5. Technical Requirements

### Input types
- Sustained touch transitioning to new position; swipe (directional transitions); hold-release-hold (posture sequences)

### Timing requirements
- Transition smoothness at ≥30Hz sampling; timing accuracy at ±100ms; preparation-phase detection

### NPC/AI requirements
- Target posture visualization (shows where to go next)
- Timing system (signals when to transition)
- Optional: movement companion who demonstrates sequences

### LLM requirements
- **Low:** Feedback text generation; contextual framing. Core body-sequencing metrics entirely algorithmic.

### State persistence
- Transition smoothness history; preparation quality; timing accuracy; sequence completion rates; awareness-during-transition indicators; ritual indicators; jerkiness indicators; rushing indicators; freeze indicators; drive/shadow signals; fatigue state; checkpoint position
