# Intrapersonal / Magenta — Scoring Skeleton

## Module Identity

- **Line:** Intrapersonal (self-knowledge, introspection, subject→object)
- **Stage:** Magenta (magical-symbolic, pre-operational, participation mystique)
- **Core capacity:** Magical self-concept — the fantasy-image of self. "I am the one who…" as imagined identity, not yet felt/reflected. Self-as-character in a magical narrative.
- **Key distinction from Infrared:** Infrared has NO self-concept (pure reaction, pre-introspective). Magenta has a MAGICAL self-concept (fantasy-image, imagined identity).
- **Key distinction from Red:** Red has EGOCENTRIC self-identification ("I am the will, I am my power"). Magenta has MAGICAL self-identification ("I am the one the spirits chose, I am the dream-character").

---

## Capacities Measured

| # | Capacity | Description |
|---|---|---|
| 1 | **Self-image recognition** | Can identify own fantasy-self-image when presented |
| 2 | **Self-other distinction** | Can distinguish "me" from "not-me" at magical level (participation mystique boundary) |
| 3 | **Self-narrative** | Can hold a story about who "I am" (magical narrative identity) |
| 4 | **Self-constancy** | Maintains self-image across contexts (proto-identity stability) |
| 5 | **Self-feeling** | Can report basic internal states ("I feel big/small/strong/scared") |

---

## Theta-Decay Parameters

| Parameter | Value | Rationale |
|---|---|---|
| Half-life | 16 days | Self-concept is more stable than moral sensing; slower decay |
| Max decay | 15% | Magical self-image is foundational; cannot fully degrade |
| Reactivation threshold | 40% | Below this, self-image becomes unstable |

---

## Drive-Health Weights

| Drive | Weight | Rationale |
|---|---|---|
| Agency | 0.35 | Self-concept requires "I am" — strong agency component |
| Communion | 0.20 | Self-concept at Magenta is less relational than later stages |
| Eros | 0.25 | Self-image reaches toward "who I could be" (magical aspiration) |
| Agape | 0.20 | Self-constancy requires returning to "who I am" (grounding) |

---

## Shadow Archetypes

| Quadrant | Archetype | Core pattern |
|---|---|---|
| Dark-Addiction | **Fantasy-Prisoner** | Trapped in inflated magical self-image; cannot see actual self |
| Dark-Allergy | **Self-Stranger** | No self-image at all; cannot answer "who am I?"; dissolved into environment |
| Golden-Addiction | **Premature Ego** | Jumps to Red-stage "I am my will" without magical self-grounding |
| Golden-Allergy | **Identity-Refuser** | Senses emerging self but refuses to claim it; stays merged |

---

## Compound Shadows (Cross-Module)

| Compound | Modules | Pattern |
|---|---|---|
| **Enchanted Self** | Intrapersonal + Cognitive | Fantasy-self reinforced by magical thinking; cannot reality-test self-image |
| **Numb Identity** | Intrapersonal + Somatic | Self-image disconnected from body; "I am" without embodiment |
| **Wish-Self** | Intrapersonal + Willpower | Self-concept = what I wish to be, not what I am; will-driven fantasy |
| **Lonely Self** | Intrapersonal + Interpersonal | Self-image that cannot include others; isolated magical identity |

---

## Scoring Formula

```
intrapersonal_magenta_score = weighted_mean(
  self_image_recognition × 0.25,
  self_other_distinction × 0.25,
  self_narrative × 0.20,
  self_constancy × 0.15,
  self_feeling × 0.15
)

drive_health_modifier = (
  agency_health × 0.35 +
  communion_health × 0.20 +
  eros_health × 0.25 +
  agape_health × 0.20
)

final_score = intrapersonal_magenta_score × drive_health_modifier
```

---

## Stage-Unlock Dependencies

- **Requires:** Infrared intrapersonal ≥ 0.3 (basic reactivity present)
- **Unlocks:** Red intrapersonal (egocentric self-identification) at ≥ 0.5
- **Shadow-mode trigger:** Score drops below 0.4 → shadow-mode encounters activate
