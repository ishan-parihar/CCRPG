# Willpower × Infrared — Strategic-Planning Game

## 1. Game Identity

**Title:** Need Path
**Modality:** Strategic-Planning (basic need-sequencing)
**Unique Lateral:** Which need first? 2-step survival sequences. At Infrared, "planning" is merely: the body must go HERE then THERE. Not abstract strategy — embodied sequencing of two mobilisation acts. The seed of temporal will.
**Core Loop:** Two need-sources visible in sequence (must pass A to reach B) → player mobilises through the path → order and commitment measured.

## 2. Catalyst Delivery

**Shadow Surfacing:**
- **DA (Drive-Fixation):** Gets stuck at first need-source. Cannot move past A to reach B. Fixates on immediate satisfaction, repeats first step endlessly.
- **DAll (Drive-Collapse):** Cannot initiate the sequence. Two steps overwhelm. Freezes at the prospect of sequential mobilisation.
- **GA (Premature Wishing):** Attempts to reach B without passing through A. Skips the necessary first step. Wants the end without the path.
- **GAll (Drive Fortress):** Completes A→B sequences perfectly but refuses any sequence that introduces a third element or novel waypoint. Locks into known paths.

**Drive Probes:**
- Eros: Sequences where B is slightly novel or beyond familiar territory. Does the organism complete the path toward the new?
- Agape: Sequences where A is a rest-point. Does the organism honour the pause before continuing?
- Agency: Self-ordered sequences. Two needs, no prescribed order — player determines path.
- Communion: Paired sequences. Player's path intersects with another entity's path.

## 3. Game Design

**Mechanics:** Top-down view. Simple creature at start. Two glowing need-objects placed in spatial sequence. Player traces/taps the path: first to A, then to B. Creature follows. Both needs satisfied in order. Extremely simple — two taps/swipes maximum.

**Progression:**
- Phase 1: Linear path. A directly before B. One direction.
- Phase 2: Branching path. A and B in different directions but A must come first (closer/more urgent).
- Phase 3: Self-ordered. Two equidistant needs — player chooses sequence.
- Phase 4: A + rest-point + B. Three-element sequence (maximum complexity at Infrared).

**Infinite Checkpoint:** Each sequence is a checkpoint. 1–20 sequences per session.

**Adaptive Difficulty:** Spatial distance increases. Rest-point timing tightens. Self-ordered trials increase. Novel waypoints introduced.

## 4. Item Pool

| Item ID | Type | Parameters | Shadow Target |
|---|---|---|---|
| NP-01 | Linear A→B | Straight path, clear order | Baseline |
| NP-02 | Fixation trap | A is highly rewarding, B visible beyond | DA detection |
| NP-03 | Two-step initiation | Sequence requires starting movement | DAll detection |
| NP-04 | Skip-temptation | B visible directly but path requires A first | GA detection |
| NP-05 | Novel waypoint B | Familiar A, unfamiliar B | GAll detection |
| NP-06 | Self-ordered pair | Equal urgency, player chooses sequence | Agency probe |
| NP-07 | Rest-as-waypoint | A = pause/settle, B = active need | Agape probe |
| NP-08 | Intersecting paths | Another creature's path crosses player's | Communion probe |
| NP-09 | Extended sequence | A → B → slight novelty C | Eros probe |

## 5. Technical Requirements

**Inputs:** Sequential taps or swipe-path. Two inputs maximum per trial (three in Phase 4).
**Timing:** Sequence completion time, dwell-time at A, transition latency A→B.
**Metrics Captured:** Sequence completion (binary), dwell-time at first node (ms), skip-attempts (tapping B before A), sequence initiation latency (ms), novel-waypoint acceptance rate, self-ordered consistency (entropy).
**Adaptive Engine:** Spatial layout adjusts based on completion rates. Fixation detected via dwell-time >2σ above baseline. Skip-attempts flag GA directly.
**Session Length:** 30–120 seconds. Minimum 5 sequences for valid scoring.
**Accessibility:** Large nodes, clear visual path indicators, optional directional audio cues, colour-blind safe urgency indicators.
