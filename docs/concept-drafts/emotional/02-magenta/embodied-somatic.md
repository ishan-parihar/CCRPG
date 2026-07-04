# Emotional / Magenta — Embodied-Somatic Game Concept

> **Axis:** The embodied-somatic axis probes emotional intelligence through THE BODY — can the player feel emotions IN the body? At Magenta, this is: "Where does the feeling live? Is it warm or cold? Heavy or light?" The body as the first emotional instrument.
>
> **Why this axis for Emotional/Magenta:** Emotions are felt IN the body before they are named or understood. At Magenta, the body IS the emotional organ — feelings are sensations. This modality tests whether the player can locate and describe emotional sensations somatically.

---

## 1. Game Identity

- **Title:** "The Feeling-Body"
- **Core mechanic:** Emotional atmospheres are presented and the player identifies WHERE in the body they feel it and WHAT it feels like somatically (warm/cold, heavy/light, tight/open, buzzing/still). The body maps the emotion.
- **Duration:** 2-4 minutes per session (infinite checkpoints; body-fatigue monitored)
- **Internal progression:** The Body-Feeling → The Feeling-Place → The Feeling-Shape → The Moving Feeling → The Emotional Body

---

## 2. Catalyst Delivery

**Catalyst:** "You feel something. Where in your body? What does it feel like there? Warm? Cold? Heavy? Light?" The contact boundary is: "Can you feel emotions in your body?"

**Unconscious response:**
- *Submergent:* How does the player's body relate to emotion? The Mood-Flooder's body is overwhelmed everywhere. The Affect-Denier's body feels nothing. The Premature Empath describes body-feelings that don't match the stimulus. The Feeling-Refuser senses body-feeling then blocks it.
- *Emergent:* Can they locate a feeling in the body and describe its somatic quality?

**Integration path:** Rewards SOMATIC AFFECT-AWARENESS — locating emotions in the body with accurate somatic description. Not overwhelmed everywhere, not numb, not performing, not blocking.

**Successful integration:** The player locates emotions in specific body areas and describes their somatic quality accurately.

---

## 3. Game Design

### Setup
The Feeling-Body: a somatic-emotional mapping space. Emotional atmospheres are presented and the player maps where they feel them in the body. The aesthetic: Magenta-stage body-map — a glowing body-outline where touched areas light up with the colour/quality of the feeling found there.

### Interaction
- **The Body-Feeling (1-5):** Clear emotion → "Where do you feel it?" Tap body-area.
- **The Feeling-Place (5-15):** Identify quality: warm/cold, heavy/light, tight/open.
- **The Feeling-Shape (15-30):** Describe the shape/size of the body-feeling.
- **The Moving Feeling (30-50):** Track how body-feelings move/change over time.
- **The Emotional Body (50+):** Full somatic-emotional mapping: locate → describe → track.

### Feedback
- Specific location + accurate quality → "There! You found it. That's where the feeling lives."
- Body-flood → "Everywhere? Let's narrow. Just ONE spot. Where is it STRONGEST?"
- Nothing → "Warm or cool? Just in your chest. Not a feeling — just temperature. What's there?"
- Over-elaborate → "Simpler. Warm or cold? That's enough. Just that."
- Approach-withdrawal → "You felt it! For a moment. That's real. Can you find it again? Just briefly."

### Difficulty Adaptation
- Emotion intensity: high (easy to feel in body) → moderate → subtle
- Body-area precision: large area → specific location → point
- Quality discrimination: binary (warm/cold) → ternary → multiple qualities
- Duration of sensing: brief → moderate → sustained
- Emotion complexity: single → shifting → mixed

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The Body-Feeling | 1-5 | Locate feeling in body (tap area) |
| The Feeling-Place | 5-15 | Describe quality (warm/cold, heavy/light) |
| The Feeling-Shape | 15-30 | Shape and size of body-feeling |
| The Moving Feeling | 30-50 | Track changes in body-feeling over time |
| The Emotional Body | 50+ | Full somatic-emotional integration |

---

## 4. Item Pool

### Item types
- **Location items:** Emotions with clear body-locations (anger→chest, fear→stomach, etc.)
- **Quality items:** Same location, different qualities (warm vs. cold in chest)
- **Shape items:** Body-feelings with distinct shapes/sizes
- **Movement items:** Body-feelings that shift location or quality
- **Subtle items:** Low-intensity body-feelings requiring careful sensing

### Minimum pool size
- 25+ location, 20+ quality, 15+ shape, 15+ movement, 10+ subtle

### Drive/shadow mapping
- All-areas/flood → dark-addiction; no-area/nothing → dark-allergy
- Elaborate/inconsistent → golden-addiction; brief-then-blocked → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-on-body-map (location); select quality (warm/cold/heavy/light/tight/open); hold (sustained sensing); drag (track movement)

### Timing requirements
- Sensing duration tracked; no time pressure; body-fatigue especially monitored (shorter sessions)

### NPC/AI requirements
- Body-map visualization (glowing outline with interactive areas)
- Emotion-to-body mapping system (expected correlates for validation)
- Quality visualization (colours/textures for somatic qualities)
- Optional: companion who shares their body-sensing

### LLM requirements
- **Low-Medium:** Open-ended somatic description evaluation; consistency checking across trials. Core tap-location and quality-selection algorithmic.

### State persistence
- Body-location patterns; quality reports; consistency scores; discrimination scores; tracking ability; flood indicators (all-areas); numbness indicators (no-area); elaboration indicators; blocking indicators; drive/shadow signals; body-fatigue state (CRITICAL); checkpoint position
