# Cognitive / Infrared — Social-Cooperative Game Concept

> **Axis:** Co-presence — basic attunement to another presence, synchrony without communication.  **Why this axis for this module:** At Infrared, "social" is simply detecting and synchronising with another moving entity; this modality probes whether the perceptual system can track and entrain to a non-self agent.

---

## 1. Game Identity

**Name:** Mirror  
**Core loop:** A second dot (the "other") moves on screen with its own rhythm. The player's dot must synchronise — match speed, match direction, match pauses. No communication, no instructions — pure perceptual attunement to another presence. The "other" can be AI-driven or another player's recorded movement.

**Session length:** 45–120 seconds per checkpoint. Infinite checkpoints.  
**Felt experience:** Like walking beside someone and falling into step. Effortless when attuned, jarring when desynchronised. The felt-sense of "being with."

## 2. Catalyst Delivery

**DA surfacing:** The other dot moves erratically. Shadow response: player tracks obsessively, mirrors every micro-movement, cannot maintain own rhythm — loses self in tracking the other.  
**DAll surfacing:** The other dot moves gently and predictably. Shadow response: player's dot drifts away, does not synchronise, ignores the other presence entirely.  
**GA surfacing:** The other dot moves randomly. Shadow response: player "reads intention" into random movement, synchronises to an imagined pattern rather than actual movement.  
**GAll surfacing:** The other dot establishes clear rhythmic pattern and pauses invitingly. Shadow response: player tracks accurately but maintains rigid independence — refuses to entrain, stays in own rhythm.

**Catalyst → Experience → Integration:** The other's movement IS catalyst. Synchronisation response IS experience. Integration = accurate attunement + maintained self-rhythm + appropriate joining and separating.

## 3. Game Design

**Mechanics:**
- Dual-dot field: player dot (controlled) + other dot (autonomous). Both on dark field.
- Synchrony measure: phase-lock between player and other movement vectors. Continuous scoring.
- Independence trials: other dot stops. Player should maintain own rhythm (not freeze). Measures Agency.
- Joining trials: other dot invites (slows, approaches). Player should match. Measures Communion.
- Separation trials: other dot diverges. Player should let go without distress. Measures healthy boundary.
- Rest synchrony: both dots pause. Shared stillness. Measures co-regulation.

**Difficulty staircase:** Other-dot complexity (simple oscillation → complex path), synchrony precision required, independence/joining ratio, speed. Adapts via phase-lock accuracy.

**Drive probing:**
- Agency: independence trials — can the player maintain own rhythm when other stops?
- Communion: joining accuracy — can the player entrain to the other?
- Eros: complexity matching — can the player follow increasingly complex other-movement?
- Agape: separation grace — can the player release synchrony without collapse?

## 4. Item Pool

| Item ID | Type | Parameters | Shadow Probed |
|---|---|---|---|
| M-01 | Simple sync | Other oscillates, player matches | Baseline |
| M-02 | Erratic other | Random movement, fast | DA (over-tracking) |
| M-03 | Gentle other | Slow, predictable | DAll (ignoring) |
| M-04 | Random other | No pattern + sync probe | GA (false attunement) |
| M-05 | Rhythmic other | Clear pattern, inviting | GAll (refuses joining) |
| M-06 | Independence | Other stops, player continues | Agency |
| M-07 | Shared rest | Both pause together | Co-regulation |
| M-08 | Separation | Other diverges gradually | Boundary health |

**Adaptive selection:** Items chosen by information gain on synchrony-theta and drive-health. Shadow probes at 20% rate.

## 5. Technical Requirements

**Input:** Touch position (player dot follows finger) or tilt (accelerometer). Continuous sampling ≥30 Hz.  
**Rendering:** Two dots on dark field. Other-dot movement pre-computed or streamed from recorded player data. Minimal GPU.  
**Scoring engine:** Phase-lock ratio (cross-correlation of movement vectors). Independence maintenance (movement during other-pause). Joining latency. Separation smoothness.  
**Data model:** Continuous synchrony signal → sync-theta → drive-health decomposition → shadow flags.  
**Accessibility:** Other-dot has distinct colour + audio signature (spatial tone follows its position). Haptic pulse when synchrony is achieved (positive feedback).  
**Session persistence:** Checkpoint after every 60s of play. Resume from last checkpoint.
