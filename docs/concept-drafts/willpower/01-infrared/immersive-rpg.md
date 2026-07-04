# Willpower × Infrared — Immersive-RPG Game

## 1. Game Identity

**Title:** The Hungry Dark
**Modality:** Immersive-RPG (ecological drive)
**Unique Lateral:** Whether need-mobilisation appears spontaneously in free-play. No prompts, no cues — an open micro-world where needs arise organically and the player either mobilises or doesn't. The ecological validity of reflex-will.
**Core Loop:** Open environment → needs emerge over time (cold creeps in, hunger grows) → player mobilises toward sources (or doesn't) → world responds → cycle continues.

## 2. Catalyst Delivery

**Shadow Surfacing:**
- **DA (Drive-Fixation):** Hoards resources. Seeks food when already fed. Returns to water source repeatedly. Cannot settle into the environment — always pursuing.
- **DAll (Drive-Collapse):** Remains stationary as needs accumulate. Cold, hungry, thirsty — but no movement. The world darkens around an immobile creature.
- **GA (Premature Wishing):** Moves toward resources but stops short. Approaches food but doesn't eat. Expects satisfaction without the final act of consumption.
- **GAll (Drive Fortress):** Satisfies basic needs efficiently but never explores. Stays in the smallest safe zone. Refuses to move beyond the known resource locations.

**Drive Probes:**
- Eros: New resource locations appear at world edges. Does the creature explore?
- Agape: Safe rest-spots exist. Does the creature use them when sated?
- Agency: No external cues for need-urgency. Player must self-monitor.
- Communion: Another creature appears. Does player's movement pattern change in response?

## 3. Game Design

**Mechanics:** Tiny open world (single screen). Simple creature controlled by tap-to-move or tilt. Needs accumulate passively (temperature drops, hunger rises — shown via creature's visual state). Resource sources scattered. No HUD numbers — only creature's body communicates need-state. No instructions.

**Progression:**
- Phase 1: Single need (hunger only), single source. Can the creature find food?
- Phase 2: Two needs, two sources. Basic ecological triage.
- Phase 3: Needs accumulate at different rates. Timing emerges naturally.
- Phase 4: World expands slightly. New areas with novel resources.

**Infinite Checkpoint:** Autosave every 15 seconds. Any exit preserves world-state.

**Adaptive Difficulty:** Need-accumulation rates adjust to player's mobilisation patterns. World size expands as exploration increases. Novel resources appear based on GAll scores.

## 4. Item Pool

| Item ID | Type | Parameters | Shadow Target |
|---|---|---|---|
| HD-01 | Single-need world | Hunger only, food visible | Baseline / DAll |
| HD-02 | Dual-need world | Hunger + cold, two sources | Triage baseline |
| HD-03 | Abundant resources | More food than needed | DA detection |
| HD-04 | Distant resource | Food requires crossing open space | DAll / GAll |
| HD-05 | Approach-without-consume | Resource requires sustained presence | GA detection |
| HD-06 | Safe rest-spot | Warm shelter, no active need | Agape probe |
| HD-07 | World-edge resource | Novel source at boundary | Eros / GAll |
| HD-08 | Companion creature | NPC with own need-patterns | Communion probe |
| HD-09 | Self-monitored need | No visual cue until critical | Agency probe |

## 5. Technical Requirements

**Inputs:** Tap-to-move, tilt-to-move, or virtual joystick. Continuous movement control.
**World Engine:** Simple 2D tile-based environment. Need-state as passive timers. Resource interaction via proximity + dwell-time.
**Metrics Captured:** Movement entropy (exploration vs. repetition), mobilisation latency from need-onset, resource-hoarding index, rest-utilisation rate, exploration radius, companion-proximity patterns.
**Adaptive Engine:** Need-accumulation rates personalised. World complexity scales with player's ecological competence. Shadow scoring from behavioural patterns over 60-second rolling windows.
**Session Length:** 60–300 seconds. Minimum 90 seconds for valid scoring.
**Accessibility:** Simple movement controls, high-contrast creature states, ambient audio cues for need-urgency, no text required.
