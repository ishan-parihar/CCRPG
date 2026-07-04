# Intrapersonal × Infrared — Deterministic

## 1. Core Mechanic

**Self-Touch vs. Other-Touch Discrimination.** The avatar receives tactile stimuli — some originating from its own body (self-generated contact), some from external sources. The player must classify each stimulus as 'self' or 'other' via a single binary input. Accuracy and reaction time are the objective measures of body-boundary integrity.

### 1.1 Stimulus Design

- **Self-touch:** avatar's limb contacts its own surface (hand touches leg, arm brushes torso)
- **Other-touch:** environmental object contacts avatar (wind, falling leaf, another creature's nudge)
- Stimuli are brief haptic pulses with directional cues (vibration pattern encodes origin)
- No verbal labels, no symbolic content — pure sensorimotor discrimination

### 1.2 Difficulty Staircase

- Level 1: self-touch and other-touch are maximally distinct (different body regions, different intensities)
- Level 2: same body region, different source
- Level 3: ambiguous stimuli (light self-contact vs. light environmental contact)
- Level 4: rapid alternation requiring sustained boundary-tracking

## 2. Shadow Probes

| Shadow | Probe Pattern | Behavioural Signal |
|--------|--------------|-------------------|
| DA (Boundary-Fixation) | Player classifies ALL ambiguous stimuli as 'other' — hypervigilant boundary | Over-rejection rate > 70% on ambiguous trials |
| DAll (Boundary-Dissolution) | Player classifies ALL ambiguous stimuli as 'self' — merged boundary | Over-acceptance rate > 70% on ambiguous trials |
| GA (Premature Self-Image) | Player responds before stimulus completes — premature certainty | RT < 150ms with error rate > 40% |
| GAll (Boundary Fortress) | Player is accurate but freezes on self-touch trials — refuses self-acknowledgment | RT on self-touch > 2x RT on other-touch |

## 3. Catalyst → Experience → Integration

### 3.1 Catalyst

Ambiguous stimuli that challenge the current boundary-model. The game delivers stimuli at the edge of the player's discrimination threshold (adaptive psychophysics).

### 3.2 Experience

The felt-sense of 'that was me' vs. 'that was not-me.' Correct discrimination produces a brief body-glow (proprioceptive confirmation). Errors produce a gentle boundary-shimmer (the boundary flickers).

### 3.3 Integration

After each block, the avatar's body-outline becomes more defined (visual feedback of boundary-clarity). Shadow-mode encounters replay the player's error-pattern as an enemy that embodies their specific shadow.

## 4. Progression

- **Diagnosis (trials 1–20):** Establish baseline discrimination accuracy and bias direction
- **Healing (trials 21–60):** Adaptive delivery targets the shadow-bias — if DA, more self-touch trials to relax boundary; if DAll, more other-touch to sharpen boundary
- **Evolution (trials 61+):** Introduce proto-emergence stimuli — self-generated movements that create novel self-contact, seeding the next stage

## 5. Scoring

- **Primary metric:** d-prime (signal detection) for self/other discrimination
- **Bias metric:** criterion shift (c) — positive = DA tendency, negative = DAll tendency
- **Speed metric:** RT distribution — premature responses flag GA, frozen responses flag GAll
- **Drive-health:** balanced d-prime with neutral criterion = healthy boundary
- **Shadow-drag:** |c| magnitude + RT anomaly severity, weighted 0.18
- **Cross-line bonus:** +0.10 when somatic-line boundary scores are also healthy (body-ground coherence)
