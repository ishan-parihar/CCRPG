# Intrapersonal / Orange — Deterministic Game Concept

> **Axis:** Objective self-knowledge through prediction accuracy and metacognitive calibration.  **Why this axis for this module:** The reflective self's core claim is "I know myself" — deterministic measurement tests whether that claim is true by comparing self-predictions to actual outcomes.

---

## 1. Game Identity

**Name:** Mirror Trials  
**Core loop:** Player predicts their own performance on upcoming tasks, executes the tasks, then confronts the discrepancy between prediction and reality. The game measures not task performance but *self-knowledge accuracy* — how well you know your own capacities, limits, and tendencies.  
**Feel:** A laboratory of self-examination. Clinical but personal. Each trial is a mirror held up with precision.

## 2. Catalyst Delivery

**Catalyst type:** Discrepancy exposure — the gap between who you think you are and who you demonstrably are.  
**DA surfacing:** The Self-Optimizer over-predicts in domains they've trained and cannot tolerate under-performance. Their predictions cluster unrealistically high. They treat calibration failure as a problem to solve rather than information to receive.  
**DAll surfacing:** The Unexamined cannot generate predictions at all, defaults to "average" or refuses specificity. Their predictions show no self-model — flat, generic, role-based.  
**GA surfacing:** The Premature Process-Self generates elaborate qualifications ("it depends on my mood…") that avoid committing to concrete numbers. Calibration is impossible because nothing was staked.  
**GAll surfacing:** The Fixed Self predicts rigidly and accurately within their known domain but refuses tasks outside it. Their self-model is precise but bounded — they will not predict in unfamiliar territory.  
**Drive probes:** Agency = willingness to commit to a specific prediction. Communion = willingness to incorporate others' predictions about you. Eros = curiosity about unknown self-aspects. Agape = acceptance of what the data reveals.

## 3. Game Design

**Prediction phase:** Before each task block, player rates confidence (0–100) on multiple dimensions: speed, accuracy, emotional response, persistence, strategy choice. Predictions are locked and cannot be revised.  
**Execution phase:** Standard cognitive/motor tasks drawn from other modules (cross-line integration). Performance is recorded on the same dimensions predicted.  
**Reflection phase:** Discrepancy scores displayed. Player categorises each gap: "I overestimated," "I underestimated," "I was accurate." System tracks whether self-categorisation matches the data.  
**Progression:** Early sessions use familiar task types (high baseline accuracy expected). Later sessions introduce novel tasks, fatigue conditions, social observation, and emotional priming to test self-knowledge under perturbation.  
**Shadow-mode:** For players with established Orange capacity, trials target the specific shadow quadrant — e.g., DA players receive tasks where "good enough" is optimal and over-performance is penalised.

## 4. Item Pool

| Item category | Examples | What it measures |
|---|---|---|
| Confidence ratings | "How many will you get right?" / "How frustrated will you feel?" | Self-prediction specificity |
| Calibration tasks | N-back, Stroop, planning puzzles, social inference | Cross-domain self-knowledge |
| Discrepancy probes | "Why was your prediction off?" (forced choice) | Metacognitive attribution |
| Boundary tasks | Novel domains, fatigue-state tasks, observed-performance tasks | Self-knowledge limits |
| Temporal predictions | "How will you perform tomorrow vs. today?" | Self-model stability |

Items scale in prediction difficulty: familiar → novel → perturbed → social → temporal.

## 5. Technical Requirements

**Adaptive engine:** Selects tasks from cross-module pools based on player's prediction-accuracy history. Targets the zone where self-knowledge breaks down.  
**Scoring:** Primary metric = calibration score (Brier score variant). Secondary = discrimination (can player distinguish their strong vs. weak domains?). Tertiary = resolution (do confidence levels map to actual probability?).  
**Data dependencies:** Requires performance data from other modules to generate cross-domain prediction opportunities. Minimum 3 sessions in 2+ other modalities before full Mirror Trials unlock.  
**Session length:** 8–15 minutes. 4–6 prediction-execution-reflection cycles per session.  
**State persistence:** Full prediction history stored for longitudinal calibration tracking. Drift detection flags when self-model accuracy changes over time.
