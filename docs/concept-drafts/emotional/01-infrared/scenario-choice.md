# Emotional × Infrared — Scenario-Choice Game

## 1. Game Identity

**Modality:** Scenario-Choice (affect-driven decisions)
**Unique axis:** Approach/avoid based on feeling-state — not thought, not strategy, only felt pull or push
**Core loop:** Stimulus appears → body feels pull or push → player moves toward or away → outcome reveals affect-accuracy
**Fantasy frame:** A creature navigates a landscape of warmth and threat. No map, no plan — only: does this feel safe or dangerous? Move toward or away.

---

## 2. Catalyst Delivery

**DA (Affect-Storm):** Every stimulus feels dangerous — the creature avoids everything, trapped in fear-loop. Catalyst: safe stimuli that reward approach despite residual activation.
**DAll (Affect-Numbness):** No stimulus produces pull or push — the creature stands still. Catalyst: high-contrast stimuli (extreme warmth vs extreme threat) that demand a directional response.
**GA (Premature Contagion):** The creature moves toward whatever another creature moves toward, ignoring own feeling. Catalyst: scenarios where other-creature's choice is wrong for self.
**GAll (Affect Fortress):** The creature only avoids — never approaches. Survival = don't move toward anything. Catalyst: rewards that require approach, escalating gently.

**Drive probes:**
- Eros: approach frequency — does the creature move toward novelty?
- Agape: return-to-centre — does the creature settle between choices?
- Agency: independent choice — does the creature choose differently from others?
- Communion: receptivity — does the creature allow stimuli to influence it?

---

## 3. Game Design

**Mechanic:** Binary directional input. Stimulus appears on screen with affective valence (colour, movement, sound). Player swipes toward (approach) or away (avoid). Speed and hesitation are measured.

**Progression:**
- Phase 1 (diagnosis): Clear stimuli (obvious warmth/threat). Measure approach/avoid ratio, latency, and hesitation patterns.
- Phase 2 (catalyst): Ambiguous stimuli that challenge detected shadows. Storm gets safe-approach trials. Numbness gets amplified valence. Fortress gets rewarded-approach sequences. Contagion gets divergent-choice trials.
- Phase 3 (integration): Mixed valence at natural pace. Confirm balanced approach/avoid with appropriate speed and low hesitation.

**Infinite checkpoint:** Each approach/avoid decision is a checkpoint. Sessions = 1–80 decisions.

---

## 4. Item Pool

| Item | Mechanic | Shadow targeted |
|---|---|---|
| Warm Path | Increases warmth-signal clarity by 20% | DA |
| Sharp Edge | Increases threat-signal intensity by 20% | DAll |
| Own Trail | Highlights player's unique choice history | GA |
| First Step | Bonus for first approach in 5+ decisions | GAll |
| Settling Ground | Bonus for pause-at-centre between decisions | DA / Agape |
| Quick Feel | Bonus for decision latency <400ms | DAll / Communion |
| Lone Walker | Bonus for choosing opposite to other-creature | GA / Agency |
| New Direction | Bonus for approaching novel stimulus type | GAll / Eros |

---

## 5. Technical Requirements

**Input:** Swipe direction (toward/away) or binary button press. Latency measured from stimulus onset to input.
**Timing:** Stimulus display ≤1 frame. Input sampling ≤16ms. Hesitation = time between stimulus and first movement.
**Scoring model:** Affect-choice accuracy = f(valence_match, latency, hesitation, approach_avoid_balance). Drive scores from probe-specific choice patterns.
**Adaptive difficulty:** Valence ambiguity increases with health. Clear stimuli for low-health players. Subtle gradients for high-health players.
**Data emitted:** Per-decision: stimulus_valence, choice(approach/avoid), latency_ms, hesitation_ms, other_creature_present, other_choice. Per-session: shadow_scores[4], drive_scores[4], affect_choice_health.
