# Emotional / Magenta — Scoring Skeleton

> **Stage essence:** Magical attribution — "the forest is angry." Emotional fusion with environment. Feelings are projected onto the world; self-other emotional boundaries do not yet exist. The player FEELS but does not yet ACT on feelings or REGULATE them.
>
> **Key distinction from Infrared:** Infrared has raw affect (fear, rage, pleasure) with no attribution. Magenta ATTRIBUTES emotion — but to the WORLD, not to self. "The forest is angry" not "I am angry."
>
> **Key distinction from Red:** Red has self-other-emotion SPLIT — "I am angry at YOU." Magenta has emotional FUSION — "we are all angry" or "the world is angry."

---

## 1. Capacities Measured

| # | Capacity | What it means at Magenta | Measurement |
|---|---|---|---|
| 1 | **Affect-sensing** | Can they detect emotional tone in the environment? | Accuracy of mood-identification in scenes |
| 2 | **Emotional-attribution** | Can they name WHO/WHAT is feeling? (even if projected) | Attribution patterns (self/other/world) |
| 3 | **Affect-contagion** | Do they catch emotions from the environment? | Contagion rate and intensity |
| 4 | **Mood-holding** | Can they stay with a feeling without fleeing? | Duration of affect-tolerance |
| 5 | **Proto-empathy** | Can they sense another's feeling (even if fused)? | Response to companion's emotional state |

---

## 2. Theta-Decay Parameters

| Parameter | Value | Rationale |
|---|---|---|
| Half-life | 12 days | Emotional capacity at Magenta is more stable than willpower (affect-sensing is partly constitutional) |
| Max decay | 18% | Floor preserves basic affect-sensing |
| Recovery rate | 1.2× per session | Emotional engagement recovers quickly at this stage |

---

## 3. Drive-Health Weight

**0.30** — Emotional health at Magenta is foundational but less differentiating than at later stages (most players have basic affect-sensing).

---

## 4. Shadow Archetypes

| Quadrant | Archetype | Core pattern |
|---|---|---|
| Dark-Addiction | **The Mood-Flooder** | Drowns in environmental emotion; cannot separate from affect-field; emotional overwhelm as identity |
| Dark-Allergy | **The Affect-Denier** | Cannot sense emotional tone; world is flat/dead; emotional numbness projected as "nothing is happening" |
| Golden-Addiction | **The Premature Empath** | Claims to read individual emotions before self-other split exists; performs empathy without genuine sensing |
| Golden-Allergy | **The Feeling-Refuser** | Senses the call to feel more deeply but refuses; retreats from emotional richness into cognitive safety |

---

## 5. Compound Shadows (Cross-Module)

| Compound | Modules involved | Pattern |
|---|---|---|
| **The Enchanted Feeler** | Emotional + Cognitive/Magenta | Magical thinking ABOUT emotions — "if I feel it, it's true" |
| **The Numb Body** | Emotional + Somatic/Magenta | Cannot sense emotions because body-awareness is absent |
| **The Wish-Storm** | Emotional + Willpower/Magenta | Emotions become wishes without differentiation — "I feel angry so I wish for destruction" |
| **The Lonely Feeler** | Emotional + Interpersonal/Magenta | Feels everything but cannot share feelings; emotional isolation |

---

## 6. Scoring Formula

```
emotional_magenta_score = (
  affect_sensing × 0.30 +
  emotional_attribution × 0.20 +
  affect_contagion × 0.20 +
  mood_holding × 0.15 +
  proto_empathy × 0.15
) × drive_health_modifier × shadow_penalty

drive_health_modifier = mean(agency_health, communion_health, eros_health, agape_health)
shadow_penalty = 1.0 - (dominant_shadow_intensity × 0.25)
```

---

## 7. Stage-Transition Indicators

**Magenta → Red transition readiness:**
- Affect-sensing consistently accurate (>0.7)
- First signs of self-attribution ("I feel..." not just "it feels...")
- Beginning of self-other emotional differentiation
- Can hold affect without flooding OR denying
- Proto-empathy shows first signs of perspective-taking (not just contagion)
