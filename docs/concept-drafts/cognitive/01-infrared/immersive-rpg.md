# Cognitive / Infrared — Immersive-RPG Game Concept

> **Axis:** Ecological sensorimotor — whether basic perceptual engagement appears spontaneously in free-play.  **Why this axis for this module:** The RPG modality tests if sensorimotor capacity emerges naturally when the player is simply placed in a perceptual environment without explicit tasks.

---

## 1. Game Identity

**Name:** Glow  
**Core loop:** The player inhabits a dark, minimal world — a single point of light (self) in a field of ambient stimuli. Objects drift, pulse, appear, vanish. There are no instructions, no goals, no score visible. The game observes what the player naturally attends to, tracks, approaches, avoids, and ignores. All assessment is implicit.

**Session length:** 60–180 seconds per checkpoint. Infinite checkpoints.  
**Felt experience:** Exploration of a living darkness. Curiosity-driven. The world responds to attention — things that are tracked glow brighter, things ignored fade. The player discovers this through play.

## 2. Catalyst Delivery

**DA surfacing:** Multiple stimuli appear simultaneously. Shadow response: player's light darts between all of them, never resting, tracking everything. The world becomes overwhelming because the player cannot select.  
**DAll surfacing:** Gentle stimuli appear and wait. Shadow response: player's light remains stationary. Nothing is approached. The world fades because nothing is attended to.  
**GA surfacing:** Random ambient events (flickers, drifts). Shadow response: player moves toward them as if they are meaningful — treats noise as signal, approaches random events with purpose.  
**GAll surfacing:** Repeated stimuli form a spatial pattern (a path, a cluster). Shadow response: player tracks individual stimuli but does not follow the emergent path — refuses the gestalt.

**Catalyst → Experience → Integration:** The living environment IS catalyst. Spontaneous perceptual behaviour IS experience. Integration = selective attention + voluntary rest + pattern-following without over-reading.

## 3. Game Design

**Mechanics:**
- Free movement: player's light moves with touch/tilt. No boundaries initially.
- Ambient ecology: 5–10 objects with varied behaviours (drift, pulse, hide, cluster, scatter).
- Attention reward: objects tracked for >1s glow brighter (positive feedback loop).
- Neglect fade: objects ignored for >5s dim and eventually vanish.
- Emergent path: after 30s, objects begin forming spatial patterns. Following = Eros signal.
- Rest zones: areas of darkness where nothing happens. Entering voluntarily = healthy Agency.
- Surprise events: sudden new stimulus. Orientation response measured (dishabituation).

**Difficulty staircase:** Object density (few → many), movement speed, pattern clarity, rest-zone accessibility. Adapts implicitly based on player behaviour — NOT explicit difficulty.

**Drive probing:**
- Agency: rest-zone visits — does the player choose stillness?
- Communion: attention-reward engagement — does the player sustain tracking?
- Eros: path-following — does the player notice and follow emergent patterns?
- Agape: return from complexity — after dense areas, does the player seek simplicity?

## 4. Item Pool

| Item ID | Type | Parameters | Shadow Probed |
|---|---|---|---|
| G-01 | Sparse field | 3 objects, slow drift | Baseline engagement |
| G-02 | Dense field | 8 objects, varied speed | DA (over-tracking) |
| G-03 | Gentle field | 2 objects, very slow | DAll (non-engagement) |
| G-04 | Noise field | Random flickers, no pattern | GA (false meaning) |
| G-05 | Pattern field | Objects form path | GAll (refuses gestalt) |
| G-06 | Rest available | Dark zone accessible | Agency (choosing rest) |
| G-07 | Surprise event | New stimulus after calm | Dishabituation |
| G-08 | Fade test | Objects dimming from neglect | Communion (sustaining) |

**Adaptive selection:** Environment composition shifts based on behavioural signals. No explicit item selection — ecology adapts continuously.

## 5. Technical Requirements

**Input:** Continuous touch/tilt for movement. Behavioural telemetry: position over time, dwell duration per object, movement velocity, rest-zone entries.  
**Rendering:** Particle-based objects with glow/fade shaders. Dark ambient field. Minimal but atmospheric. 60 FPS target.  
**Scoring engine:** Attention distribution (entropy across objects). Rest-zone frequency. Path-following index. Surprise-orientation latency. Engagement duration before voluntary exit.  
**Data model:** Continuous behavioural stream → feature extraction → ecological-theta → drive-health decomposition → shadow flags. All implicit — no trial structure.  
**Accessibility:** Objects have audio signatures (spatial audio). Haptic proximity feedback. High-contrast mode available. No text, no symbols.  
**Session persistence:** Continuous autosave. Resume from exact world-state. No checkpoint structure — the world persists.
