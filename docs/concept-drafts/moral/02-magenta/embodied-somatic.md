# Moral / Magenta — Embodied-Somatic Game Concept

> **Axis:** The embodied-somatic axis probes moral intelligence through THE BODY — can the player feel sacred weight somatically? At Magenta, this is: "Where in your body do you feel that this is forbidden? What does 'sacred' feel like in your stomach? Your chest?" The body as moral sensor.
>
> **Why this axis for Moral/Magenta:** Before cognitive moral reasoning (Red+), moral weight is felt IN THE BODY. The "gut feeling" of right and wrong. The heaviness of taboo. The warmth of the sacred. This modality tests whether the player's body registers moral weight.

---

## 1. Game Identity

- **Title:** "The Weight-Body"
- **Core mechanic:** Sacred and profane content is presented. The player reports WHERE in their body they feel moral weight and WHAT it feels like. Not thinking about morality — FEELING it somatically. "Where does 'forbidden' live in your body? What does 'sacred' feel like?"
- **Duration:** 2-4 minutes per session (infinite checkpoints; body-fatigue monitored)
- **Internal progression:** The First Weight → The Body-Sacred → The Forbidden-Feeling → The Moral-Gut → The Living Conscience-Body

---

## 2. Catalyst Delivery

**Catalyst:** "This thing is sacred. Where do you feel that? In your chest? Your stomach? Your hands? What does it feel like — heavy? warm? tight? Where does your body know this matters?" The contact boundary is: "Does your body register moral weight?"

**Unconscious response:**
- *Submergent:* How does the player's body respond to moral content? The Taboo-Slave's body is OVERWHELMED (everything heavy, everything tight). The Profane-Breaker's body registers NOTHING (no somatic moral response). The Premature Rule-Maker describes body-responses that match rules not sensing. The Ritual-Refuser's body responds then shuts down.
- *Emergent:* Can their body register moral weight at calibrated intensity?

**Integration path:** Rewards SOMATIC MORAL SENSING — the body registering sacred weight with appropriate intensity. Not overwhelmed, not numb, not performed, not blocked.

**Successful integration:** The player's body reliably registers moral weight — the somatic foundation of conscience.

---

## 3. Game Design

### Setup
The Weight-Body: a somatic-moral space. Sacred and profane content is presented. The player maps where moral weight lives in their body. The aesthetic: Magenta-stage body-altar — a body-outline that glows where moral weight is felt. Sacred content approaches and the body-map responds.

### Interaction
- **The First Weight (1-5):** Sacred item → "Where in your body?" Tap body-area.
- **The Body-Sacred (5-15):** Identify quality: heavy/light, warm/cold, tight/open for moral content.
- **The Forbidden-Feeling (15-30):** Different moral weights → different body-responses. Discrimination.
- **The Moral-Gut (30-50):** Reduced visual cues → feel moral weight from body alone.
- **The Living Conscience-Body (50+):** Full somatic-moral integration: detect + locate + qualify + discriminate.

### Feedback
- Calibrated body-response → "Your body knows! Right there. That's where your conscience lives."
- Overwhelm → "Lighter. Not everything is heavy. THIS one — just ordinary. Feel the lightness."
- Nothing → "Warmer or cooler? Just in your chest. This one matters. Does your body know?"
- Rule-driven → "Forget right and wrong. Just body. What happens in your stomach? Just that."
- Shutdown → "You felt it! For a moment. That's real. Can you let it stay? Just one more second?"

### Difficulty Adaptation
- Sacred intensity: strong (easy to feel) → moderate → subtle
- Body-area precision: large area → specific location
- Quality discrimination: binary (heavy/light) → multiple qualities
- Cue availability: visual + somatic → somatic only
- Duration: brief exposure → sustained moral content

### Internal Progression
| Phase | Checkpoint range | What changes |
|---|---|---|
| The First Weight | 1-5 | Basic body-response to sacred (tap area) |
| The Body-Sacred | 5-15 | Quality of body-response (heavy/light/warm/cold) |
| The Forbidden-Feeling | 15-30 | Different moral weights → different body-responses |
| The Moral-Gut | 30-50 | Body-only detection (reduced visual cues) |
| The Living Conscience-Body | 50+ | Full somatic-moral integration |

---

## 4. Item Pool

### Item types
- **High-weight sacred:** Strong moral weight (easy body-response)
- **Ordinary items:** No moral weight (body should register "light/nothing")
- **Differentiated sacred:** Different KINDS of moral weight (forbidden vs. precious vs. honoured)
- **Subtle sacred:** Low moral weight requiring sensitive body-detection
- **Novel sacred:** Unfamiliar moral content requiring fresh body-response

### Minimum pool size
- 25+ high-weight, 25+ ordinary, 20+ differentiated, 15+ subtle, 10+ novel

### Drive/shadow mapping
- Body-overwhelm (all heavy) → dark-addiction; zero body-response → dark-allergy
- Rule-driven body-reports → golden-addiction; response-then-shutdown → golden-allergy

---

## 5. Technical Requirements

### Input types
- Tap-on-body-map (where weight is felt); select quality (heavy/light/warm/cold/tight/open); hold (sustain sensing)

### Timing requirements
- Response latency tracked; no time pressure; body-fatigue especially monitored

### NPC/AI requirements
- Sacred content system with varying moral weight
- Body-map visualization (interactive body-outline)
- Weight-response correlation system (expected body-responses for sacred levels)
- Difficulty adaptation (intensity, cues, novelty)

### LLM requirements
- **Low-Medium:** Open-ended somatic description evaluation; rule-driven detection; consistency checking. Core tap-location and quality-selection algorithmic.

### State persistence
- Body-response patterns; quality reports; discrimination scores; calibration accuracy; location consistency; stability scores; overwhelm indicators; numbness indicators; rule-driven indicators; shutdown indicators; drive/shadow signals; body-fatigue state; checkpoint position
