# Spiritual × Infrared — Deterministic Game

## 1. Core Concept

**Title:** The Vast Flicker

The player sits at a campfire in darkness. Periodically, something vast appears at the edge of perception — a sky full of stars revealed by parting clouds, a massive shape moving in distant firelight, a sudden silence that implies enormity. The game measures the organism's raw awe-response: how quickly startle converts to wonder, how strongly novelty registers, and how resistant the response is to habituation.

No symbols. No meaning. Only: does the vast still strike you?

## 2. Mechanical Specification

**Input:** Single tap/press when struck by wonder (not when startled — the distinction IS the measurement).

**Stimuli:** Procedurally generated "vast reveals" — visual expansions, sudden depth-of-field shifts, luminance blooms, low-frequency audio swells. Each stimulus has a novelty-index (0–1) and a magnitude-index (0–1).

**Metrics captured:**
- Startle-to-wonder latency: time between stimulus onset and player's wonder-tap (vs. flinch-tap, distinguished by timing signature)
- Novelty-response magnitude: tap-pressure/hold-duration correlating with felt intensity
- Habituation resistance: does the Nth presentation of similar vastness still evoke response?
- False-positive rate: tapping at non-vast moments (premature animism signal)
- Non-response rate: failing to tap at genuine vast-reveals (awe-numbness signal)

**Difficulty staircase:** Stimuli become subtler; vast-reveals become less dramatic; the game tests whether quiet enormity still registers.

## 3. Shadow Diagnostics

| Shadow | Behavioural Signal |
|---|---|
| DA (Awe-Fixation) | Extremely long hold-durations; inability to release tap; delayed return to baseline between stimuli |
| DAll (Awe-Numbness) | Non-response to genuine vast-reveals; flat timing profile; no differentiation between stimuli |
| GA (Premature Animism) | High false-positive rate; tapping at ordinary moments; no discrimination between vast and non-vast |
| GAll (Awe Fortress) | Correct startle response but immediate suppression; short hold-durations despite high-magnitude stimuli |

## 4. Catalyst → Experience → Integration

**Catalyst:** The vast-reveal itself — an intrusion of enormity into the ordinary firelit world.

**Experience:** The felt-sense of being struck. The game does not explain or interpret — it simply presents and measures. The player's body responds or doesn't.

**Integration:** After each sequence, a brief return-to-ordinary phase (fire crackling, warmth, safety). The game measures whether the player can hold both — the vast AND the ordinary. This is the proto-spiritual integration: wonder that doesn't destroy groundedness.

**Healing vector (bottom-up):** For awe-numbness — stimuli gradually increase in magnitude until response is evoked; for awe-fixation — return-to-ordinary phases are gently shortened then restored.

**Evolution vector (top-down):** For premature animism — stimuli become more discriminating, rewarding genuine response over indiscriminate tapping; for awe-fortress — the game holds space longer, allowing the response to exist without demanding meaning.

## 5. Infinite Checkpoint Structure

Each session = one fire-sitting (3–8 minutes). Progress saved per-stimulus-response. The player can leave at any campfire-return moment. Theta-decay ensures the awe-response must be periodically re-demonstrated — wonder is not a one-time achievement but an ongoing capacity.
