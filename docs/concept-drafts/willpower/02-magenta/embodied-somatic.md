# Willpower / Magenta — Embodied-Somatic Game Concept

> **Axis:** The embodied-somatic axis probes willpower through THE BODY — can the player hold a wish IN the body? At Magenta, this is body-as-wish-vessel: holding a posture because you WANT to, sustaining effort because the body carries the wish. The body as the first instrument of will.
>
> **Why this axis for Willpower/Magenta:** Before willpower becomes cognitive (planning, strategy), it is SOMATIC — the body holds the intention. A child holds still because they WANT the reward. The body is the first will-instrument. This modality tests whether the body can serve the wish.

---

## 1. Game Identity

- **Title:** "The Wish-Body"
- **Core mechanic:** The player holds body-states (postures, sustained touches, rhythmic actions) in service of a declared wish. The body carries the wish. Effort is somatic — holding, sustaining, persisting physically. The question: can the body serve the will?
- **Duration:** 2-4 minutes per session (infinite checkpoints; body-fatigue especially monitored)
- **Internal progression:** The Wish-Hold → The Wish-Reach → The Wish-Persist → The Body-Patience → The Wishing Body

---

## 2. Catalyst Delivery

**Catalyst:** "You wish for X. Hold this shape and the wish comes closer. Can your body hold for your wish?" The contact boundary is: "Can your body serve your will?"

**Unconscious response:**
- *Submergent:* How does the body relate to the wish? The Magical Demander's body demands without holding. The Wish-Abandoner's body collapses immediately. The Premature Disciplinarian's body forces rigidly. The Effort-Refuser's body won't engage.
- *Emergent:* Can the body hold gently in service of the wish? Can effort be wish-fuelled?

**Integration path:** Rewards WISH-FUELLED BODY-EFFORT — the body holds because the wish gives it reason. Not forced holding, not collapsed holding, not rigid holding, not refusal to hold.

**Successful integration:** The player's body holds in service of a wish — gentle, sustained, wish-motivated physical effort.

---

## 3. Game Design

### Setup
The Wish-Body: a somatic wish-holding space where the body carries the intention. The aesthetic: Magenta-stage body-temple — the player's body-outline holds a glowing wish. When the body holds stably, the wish grows brighter and closer. When the body collapses or forces, the wish dims or retreats.

### Interaction
- **The Wish-Hold (1-5):** Declare wish → hold posture for 3s → wish approaches. Simple.
- **The Wish-Reach (5-15):** Hold longer (5-8s) → wish comes closer. Body sustains for desire.
- **The Wish-Persist (15-30):** Hold through mild distraction. Body persists for the wish.
- **The Body-Patience (30-50):** Hold with GENTLENESS. Force pushes wish away. Patience draws it near.
- **The Wishing Body (50+):** Full wish-body integration: gentle, sustained, wish-fuelled effort.

### Feedback
- Gentle sustained hold → "Your body holds. The wish comes closer. Beautiful patience."
- Aggressive forcing → "Too hard. The wish retreats from force. Softer. Patient."
- Immediate collapse → "Your body let go. The wish is still there. Try again. Just 1 second."
- Rigid holding → "You're holding but where's the wish? Feel it. Hold FOR it, not just hold."
- Approach-withdrawal → "You started! That's real. Now just one more moment. The wish is close."

### Difficulty Adaptation
- Hold duration: 1s → 3s → 5s → 8s → 12s
- Gentleness requirement: any hold → moderate gentleness → high gentleness
- Distraction during hold: none → mild → moderate
- Wish-connection requirement: implicit → explicit → self-reported
- Effort-step complexity: single hold → hold + reach → hold + reach + persist

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Wish-Hold | 1-5 | Brief hold; wish approaches |
| The Wish-Reach | 5-15 | Longer hold; wish comes closer |
| The Wish-Persist | 15-30 | Hold through distraction |
| The Body-Patience | 30-50 | Gentle holding; force penalised |
| The Wishing Body | 50+ | Full wish-body integration |

---

## 4. Item Pool Specification

### Item types
- **Hold postures:** Various positions with wish-connection
- **Duration challenges:** Increasing hold-times
- **Gentleness challenges:** Holding with decreasing force
- **Distraction items:** Stimuli during hold that test persistence
- **Wish-connection items:** Tasks requiring explicit wish-awareness during hold

### Minimum pool size
- 25+ holds, 20+ duration, 15+ gentleness, 15+ distraction, 10+ wish-connection

### Drive/shadow mapping
- Aggressive forcing → dark-addiction; immediate collapse → dark-allergy
- Rigid/joyless holding → golden-addiction; approach-withdrawal → golden-allergy

---

## 5. Technical Requirements

### Input types
- Sustained touch (hold); pressure-sensitive touch (gentleness); hold-through-distraction

### Timing requirements
- Hold duration at ≥30Hz; force/pressure at ≥10Hz; distraction-response timing

### NPC/AI requirements
- Wish visualization that responds to body-effort (approaches with gentle hold, retreats with force)
- Distraction system (competing stimuli during hold)
- Optional: companion who models wish-body holding

### LLM requirements
- **Low:** Wish-context generation; feedback text. Core body-effort metrics entirely algorithmic.

### State persistence
- Hold durations; gentleness scores; wish-connection indicators; persistence-through-distraction; effort-initiation rates; force/aggression indicators; collapse indicators; rigidity indicators; approach-withdrawal indicators; drive/shadow signals; body-fatigue state (CRITICAL); checkpoint position
