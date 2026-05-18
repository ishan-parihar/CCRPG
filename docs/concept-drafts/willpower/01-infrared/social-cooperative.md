# Willpower × Infrared — Social-Cooperative Game

## 1. Game Identity

**Title:** Move Together
**Modality:** Social-Cooperative (shared mobilisation)
**Unique Lateral:** Co-mobilising with another presence toward shared need. At Infrared, "social" is not communication — it is the body moving WITH another body. Herd-mobilisation. The will that activates because another is already moving.
**Core Loop:** Need-cue appears → NPC/co-player begins mobilising → player joins (or doesn't) → shared mobilisation satisfies need faster → rest together.

## 2. Catalyst Delivery

**Shadow Surfacing:**
- **DA (Drive-Fixation):** Continues mobilising after partner has stopped. Cannot rest when the other rests. Compulsive movement regardless of shared satiation signal.
- **DAll (Drive-Collapse):** Partner's mobilisation fails to activate player's own. Even social contagion cannot overcome the freeze. Presence of other does not catalyse movement.
- **GA (Premature Wishing):** Expects partner to do all mobilisation. Waits for shared-need to be met by the other. Parasitic non-movement.
- **GAll (Drive Fortress):** Mobilises independently but refuses synchronisation. Will move alone but not WITH. Rejects the relational dimension of will.

**Drive Probes:**
- Eros: Partner mobilises toward something slightly novel. Does player follow into the new?
- Agape: Partner rests. Does player rest WITH, or continue alone?
- Agency: Trials where player must initiate and partner follows. Can the player lead mobilisation?
- Communion: Pure synchronisation trials. Matching rhythm/timing with partner's movement.

## 3. Game Design

**Mechanics:** Two creatures on screen — player's and NPC partner's. Need-source visible. NPC begins moving toward it. Player joins by tapping/holding in rhythm with NPC's movement. Shared movement fills need-meter faster than solo. Visual: creatures pulse together when synchronised.

**Progression:**
- Phase 1: NPC leads, player follows. Simple co-mobilisation.
- Phase 2: Alternating lead. Sometimes player must initiate.
- Phase 3: Synchronisation matters — timing alignment measured.
- Phase 4: NPC moves toward novel source. Does player follow?

**Infinite Checkpoint:** Each co-mobilisation cycle is a checkpoint. 1–20 cycles per session.

**Adaptive Difficulty:** Synchronisation window tightens. Lead/follow alternation increases. Novel-direction trials introduced. Rest-synchronisation required.

## 4. Item Pool

| Item ID | Type | Parameters | Shadow Target |
|---|---|---|---|
| MT-01 | Follow-mobilise | NPC leads, generous sync window | Baseline / DAll |
| MT-02 | Lead-mobilise | Player must initiate, NPC follows | Agency probe |
| MT-03 | Shared rest | Both must stop simultaneously | DA detection |
| MT-04 | Partner-carries | NPC does most work, player minimal | GA detection |
| MT-05 | Novel direction | NPC moves toward unfamiliar source | GAll detection |
| MT-06 | Tight sync | Narrow timing window for co-movement | Communion probe |
| MT-07 | Rest-with | NPC rests, player must match stillness | Agape probe |
| MT-08 | Beyond-together | Both move toward extended distance | Eros probe |
| MT-09 | Solo-refusal | NPC absent, player must mobilise alone | Agency baseline |

## 5. Technical Requirements

**Inputs:** Tap rhythm, hold-sync, or movement matching. Same input vocabulary as other games.
**Timing:** Synchronisation measured as phase-offset between player input and NPC rhythm (ms).
**Metrics Captured:** Sync accuracy (phase-offset), follow-latency (ms from NPC start to player start), lead-willingness (binary), shared-rest compliance, novel-direction follow rate, solo-vs-paired mobilisation difference.
**Adaptive Engine:** NPC rhythm calibrates to player's natural tempo. Sync windows narrow as accuracy improves. Shadow detection via paired-vs-solo performance differential.
**Session Length:** 45–150 seconds. Minimum 6 co-mobilisation cycles for valid scoring.
**Accessibility:** Visual rhythm indicators, haptic pulse matching NPC timing, audio heartbeat sync option.
