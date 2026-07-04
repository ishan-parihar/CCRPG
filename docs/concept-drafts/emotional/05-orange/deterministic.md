# Emotional / Orange — Deterministic Game Concept

> **Axis:** Objective emotional measurement through fixed-mechanic tasks.  **Why this axis for this module:** Reflective emotional self-awareness has measurable behavioural signatures — labelling accuracy, regulation effectiveness, interference resistance — that require no language, body, or social context to assess.

---

## 1. Game Identity

**Name:** Affect Calibration Chamber
**Fantasy:** The player is a resonance analyst in a crystalline observatory, tuning emotional frequencies to precise wavelengths. Each crystal emits an affective signal; the player must identify, categorise, and regulate the signal to maintain observatory stability.

**Core loop:** Perceive emotional stimulus → label with granular precision → select regulation strategy → demonstrate interference resistance → integrate emotion into decision output.

## 2. Catalyst Delivery

**DA surfacing:** Player who over-regulates shows suppression patterns — fast labelling but flat arousal, regulation strategies applied before feeling registers. The system detects regulation-without-experience.
**DAll surfacing:** Player who cannot label shows low granularity — "angry" instead of "frustrated/irritated/indignant." Emotional Stroop interference is high (emotion hijacks rather than informs).
**GA surfacing:** Player who performs empathy shows inconsistency — high labelling of others' emotions, low accuracy on self-referential stimuli.
**GAll surfacing:** Player who walls off shows strong self-regulation but avoidance of stimuli requiring empathic resonance.

**Heal/Evolve path:** Agape tasks require the player to stay with an emotion longer before regulating. Agency tasks require precise self-labelling under pressure.
**Evolve/Heal path:** Eros tasks introduce stimuli requiring empathic extension. Communion tasks require emotion-sharing outputs.

## 3. Game Design

**Mechanic 1 — Affect Labelling Grid:** Faces/scenes flash; player selects from a granularity wheel (6 basic → 24 nuanced → 48 micro-emotions). Accuracy and granularity depth scored independently.
**Mechanic 2 — Regulation Strategy Selector:** After labelling, player chooses a regulation approach (reappraisal, distraction, acceptance, suppression, expression). Context determines which is adaptive. Suppression is sometimes correct — the test is whether it's the only tool.
**Mechanic 3 — Emotional Stroop:** Emotional words/images appear during a primary task. Interference (RT slowdown) measures whether emotion hijacks or informs. Decreasing interference = growing regulation.
**Mechanic 4 — Emotion-Decision Integration:** A decision point appears; one option is emotionally informed, one is emotionally avoidant, one is emotionally hijacked. The player must select the integrated path.

**Difficulty staircase:** Granularity depth increases, regulation contexts become more ambiguous, Stroop stimuli become more personally relevant (adaptive), decision points become more complex.

## 4. Item Pool

| Item type | Examples | Count |
|---|---|---|
| Facial affect stimuli | Micro-expression photographs, morphed composites | 200+ |
| Scenario vignettes | 2-sentence situations requiring labelling | 120 |
| Emotional Stroop words | Valenced words across 6 emotion families | 180 |
| Regulation contexts | Situations where each strategy has different efficacy | 80 |
| Decision scenarios | Emotion-as-data integration points | 60 |

All items tagged by: emotion family, granularity tier, arousal level, valence, cultural sensitivity flag.

## 5. Technical Requirements

- **Adaptive engine:** IRT-based item selection; difficulty adjusts per-mechanic independently
- **RT measurement:** Millisecond-precision reaction time for Stroop interference calculation
- **Arousal proxy:** If device supports (heart rate via camera/wearable), correlate self-report with physiological signal for DA detection
- **Session length:** 4–8 minutes per checkpoint; infinite checkpoints
- **Scoring output:** Granularity depth (1–5), regulation flexibility (strategy diversity index), interference coefficient, integration accuracy
- **Shadow flags:** Suppression-only regulation → DA; low granularity + high interference → DAll; other-focused accuracy > self-focused → GA; avoidance of empathic stimuli → GAll
