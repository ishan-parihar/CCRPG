# Somatic / Magenta — Scoring

> **Line:** Somatic (body-awareness, proprioception, rhythm, coordination)
> **Stage:** Magenta / Magic (body-fantasy, feeling-tone, "my body is magic")
> **Vibration:** The body as magical vessel — posture has power, gesture has force, the body FEELS the world before the mind knows it. Undifferentiated body-sense fused with imagery.

---

## 1. Capacity Definition

Somatic intelligence at Magenta is **body-fantasy capacity** — the body is experienced as magical, alive, powerful. Posture "does things." Gesture "makes things happen." The body is not yet a skilled instrument (Red) or a disciplined form (Amber) — it is a VESSEL of felt-sense, a magical container that responds to the world through feeling-tone.

### Core capacities measured

| Capacity | Definition | Assessment vehicle |
|---|---|---|
| **Feeling-tone awareness** | Can the player sense the body's overall state? (pleasant/unpleasant/neutral) | Body-state identification; felt-sense labelling |
| **Postural holding** | Can the player hold a posture stably? (body-as-vessel) | Sustained input stability; posture-hold duration |
| **Gross-motor rhythm** | Can the player move in time with a simple beat? | Single-beat synchronisation; tap-to-rhythm |
| **Body-boundary sense** | Can the player sense where their body ends? (proprioceptive boundary) | Body-zone identification; spatial-body awareness |
| **Arousal-state recognition** | Can the player sense whether they're activated or calm? | Arousal-level identification (high/medium/low) |

### What this is NOT (Red ceiling above, Infrared floor below)

- **NOT Infrared:** Infrared is pure reflex — the body reacts without awareness. Magenta ADDS felt-sense: the body is EXPERIENCED, not just reactive.
- **NOT Red:** Red is power-body — strength, speed, dominance, muscular expression. Magenta is body-FANTASY — the body is magical, not yet powerful in the Red sense. The player cannot yet coordinate complex power-movements or sustain high-intensity physical effort.

---

## 2. Scoring Architecture

### 2.1 Theta (capacity estimate)

**Model:** 1PL IRT with Bayesian updating
- **Prior:** N(0, 1) at first encounter
- **Item difficulty:** Calibrated per feeling-tone, postural-holding, gross-motor-rhythm, body-boundary, arousal-state
- **Update:** After each response (accuracy + timing as secondary)

### 2.2 Composite score

```
somatic_magenta = weighted_aggregate(
  feeling_tone_awareness: 0.25,
  postural_holding:       0.25,   ← tied heaviest — body-as-vessel IS Magenta somatic
  gross_motor_rhythm:     0.20,
  body_boundary_sense:    0.15,
  arousal_state_recognition: 0.15
)
```

### 2.3 Theta-decay

- **Half-life:** 12 days (somatic is fast-moving; body-sense needs regular engagement)
- **Max decay:** 20% of peak theta
- **Rationale:** Body-awareness at Magenta is use-it-or-lose-it; without regular somatic engagement, felt-sense regresses to Infrared reflex

### 2.4 Stage-transition threshold

- **Magenta → Red unlock:** Theta ≥ 0.7 on postural-holding AND gross-motor-rhythm ≥ 0.5
- **Confirmation:** Must demonstrate across ≥ 3 sessions
- **Cross-line requirement:** At least 1 other line at Magenta

---

## 3. Drive-Health Integration

### 3.1 Drive-health weight for Somatic/Magenta

**Weight: 0.35** (moderate-high — somatic is a primary line; at Magenta the body is the primary mode of being)

### 3.2 Healthy drive expression at Somatic/Magenta

| Drive | Healthy expression |
|---|---|
| **Agency** | Inhabits body independently; holds posture by own will; moves with autonomy |
| **Communion** | Shares body-space with others; moves in rhythm with companion; receives touch/proximity |
| **Eros** | Reaches toward new body-experiences with curiosity; wants to feel more |
| **Agape** | Returns to familiar body-states with care; maintains body-awareness; embodies felt-sense |

### 3.3 Pathological drive expression at Somatic/Magenta

| Drive | Dark-domain pathology | Golden-domain pathology |
|---|---|---|
| **Agency** | Uses body to dominate space (takes up all room; pushes) | Cannot inhabit body without external permission |
| **Communion** | Loses body-boundary in others' presence (fusion) | Cannot share body-space (rigid isolation) |
| **Eros** | Refuses new body-experiences; clings to familiar states | Rushes past body-awareness toward "mind" |
| **Agape** | Cannot return to simple body-states; always seeking intensity | Cannot embody; stays in fantasy about the body |

---

## 4. Shadow Summary

| Quadrant | Archetype | Core pattern |
|---|---|---|
| **Dark-Addiction** | The Body-Magician | Believes the body literally has magical powers — posture CONTROLS reality; gesture FORCES outcomes; body-fantasy as omnipotence |
| **Dark-Allergy** | The Disembodied | Refuses body-awareness; lives "in the head"; body is ignored, neglected, or feared |
| **Golden-Addiction** | The Premature Athlete | Rushes toward power-body (Red) without establishing felt-sense; performs physical feats without body-awareness |
| **Golden-Allergy** | The Sensation-Refuser | Fears body-sensation; the felt-sense is threatening; approach-withdrawal with somatic experience |

### 4.1 Compound shadows (cross-module)

| Compound | Modules involved | Pattern |
|---|---|---|
| **The Enchanted Body** | Somatic/Magenta dark-addiction + Cognitive/Magenta dark-addiction | Body AND mind both trapped in magical thinking; total fusion of fantasy and physicality |
| **The Ghost** | Somatic/Magenta dark-allergy + Intrapersonal/Magenta dark-allergy | No body-sense AND no self-sense; floating without ground or identity |
| **The Performing Athlete** | Somatic/Magenta golden-addiction + Willpower/Magenta golden-addiction | Rushes to physical performance without felt-sense or sustained effort; all show, no ground |
| **The Frozen Dreamer** | Somatic/Magenta golden-allergy + Emotional/Magenta dark-allergy | Fears body-sensation AND emotional experience; trapped in cognitive-only mode |

---

## 5. Modality Affinity

| Modality | Affinity | Rationale |
|---|---|---|
| Deterministic | ★★★★☆ | Postural holding and rhythm are objectively measurable |
| Language-reflective | ★★☆☆☆ | Limited — body-sense at Magenta is pre-verbal; hard to articulate |
| Scenario-choice | ★★★☆☆ | Body-choices (posture selection, movement choice) |
| Embodied-somatic | ★★★★★ | This IS the somatic line — maximum affinity |
| Strategic-planning | ★★☆☆☆ | Minimal — body at Magenta doesn't plan; it feels |
| Social-cooperative | ★★★★☆ | Shared rhythm, coordinated movement, body-proximity |
| Immersive-rpg | ★★★★★ | The body navigates the magical world; ecological somatic engagement |

---

## 6. Cross-Validation Rules

- **Deterministic × Embodied-somatic:** If deterministic shows poor postural holding but embodied-somatic shows high engagement → dark-addiction (body-fantasy without actual capacity)
- **Language-reflective × Deterministic:** If language shows sophisticated body-talk but deterministic shows poor body-sense → golden-addiction (talking about the body without inhabiting it)
- **Immersive-rpg × Deterministic:** If ecological engagement is high but structured body-tasks fail → engagement without capacity (possible dark-addiction)
- **Social-cooperative × Deterministic:** If shared rhythm works but solo rhythm fails → communion-dependent somatic capacity (possible communion dark-domain issue)
