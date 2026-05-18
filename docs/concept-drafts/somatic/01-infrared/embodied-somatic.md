# Somatic / Infrared — Embodied-Somatic Game Concept

> **Axis:** The body itself — reflex integration, tension-release, basic motor coordination.  **Why this axis for this module:** This is the most direct modality for Somatic/Infrared — the body working on the body. No abstraction, no metaphor. Pure reflex integration through tension-release and motor coordination.

---

## 1. Game Identity

**Name:** Tension-Wave  
**Core loop:** Body area activates (tension builds) → player engages that area (press-hold) → tension peaks → player releases → body settles → next area activates. The wave moves through the body.  
**Feel:** A body-map glowing with tension zones. Warm, pulsing, deeply physical. The player IS the body — pressing into tension and releasing it. Meditative but primal. No narrative, no enemy — the body is both the terrain and the practice.  
**Session length:** 120–300 seconds per checkpoint. Infinite checkpoints.

## 2. Catalyst Delivery

**Catalyst frequency:** Red-ray embodiment — the most fundamental somatic catalyst: inhabiting the body, feeling it, completing its tension cycles.  
**Catalyst → Experience:** The game creates genuine tension-release experiences. Press-and-hold builds real isometric engagement; release creates real felt-sense of letting go. The body learns through doing.  
**Experience → Integration:** Completing tension-release cycles across the body-map teaches the nervous system that tension is not permanent, that activation resolves, that the body can hold AND release. This is the foundation of all somatic regulation.

**Drive probing:**
- **Agency:** Grip strength and engagement intensity during tension phase (willingness to hold)
- **Communion:** Release quality — can the body actually let go, or does it grip past the cue?
- **Eros:** Willingness to engage new body zones (reaching into unfamiliar tension)
- **Agape:** Depth of settling after release (return to embodied rest)

**Shadow surfacing:**
- DA: Cannot release — grip persists past cue, tension never resolves, body stays activated
- DAll: Cannot engage — grip force minimal or absent, body won't activate, zones skipped
- GA: Attempts flowing wave-patterns before individual zones are integrated (premature fluidity)
- GAll: Engages only "survival" zones (hands, feet, jaw) — refuses torso, belly, throat

## 3. Game Design

**Mechanics:**
- Body-map displayed: simplified human form with 8–12 tension zones
- Zones illuminate sequentially (guided) or randomly (adaptive)
- Press-and-hold on illuminated zone: pressure must reach threshold and sustain for 2–5s
- Release cue: zone colour shifts, haptic pulse signals "let go now"
- Settling phase: 3–8s of no input, measuring whether pressure truly drops to zero
- Wave completion: all zones cycled = one full body-wave

**Adaptive staircase:**
- Hold duration scales with demonstrated release quality
- Zone selection adapts: avoided zones get gentler activation cues
- If DA detected: extend release phases, add settling rewards, reduce hold demands
- If DAll detected: lower activation threshold, reward any engagement, shrink zone size
- If GAll detected: gradually introduce non-extremity zones with safety cues

**Progression (within-session):**
1. Single-zone: one zone at a time, full tension-release cycle
2. Sequential: 3–4 zones in sequence, building body-awareness
3. Wave: full body-map traversal, tension flows zone-to-zone
4. Integration: free-form — zones illuminate based on detected residual tension

## 4. Item Pool

| Item Category | Examples | Shadow Targeted |
|---|---|---|
| Body zones | Hands, feet, jaw, shoulders, belly, chest, throat, back | GAll (avoidance patterns) |
| Hold durations | 2s, 3s, 4s, 5s | DA (over-hold), DAll (under-hold) |
| Release cues | Colour shift, haptic pulse, tone drop | Communion (can you follow the cue?) |
| Settling durations | 3s, 5s, 8s | DA (cannot settle), Agape (rest depth) |
| Activation intensity | Gentle glow, warm pulse, strong vibration | DAll (threshold), DA (over-response) |
| Wave patterns | Linear (head→feet), random, bilateral | GA (premature pattern-seeking) |

The body-map is abstract — no realistic anatomy. Zones are felt-sense regions, not medical diagrams.

## 5. Technical Requirements

**Input:** Touch (press location, pressure/duration, release timing), multi-touch for bilateral zones  
**Output:** Visual body-map with zone illumination, haptic feedback (tension=vibration, release=stillness), audio (low drone during hold, silence during settle)  
**Pressure sensing:** Force-touch or duration-as-proxy; calibrated to player's baseline grip in first 10s  
**Data captured:** Per-zone hold duration, peak pressure, release latency (cue-to-zero), settling quality (residual pressure), zone-avoidance patterns, wave-completion rate  
**Adaptive engine:** Zone selection weighted by avoidance history; hold/release targets personalised to player's demonstrated range; shadow-profile updated per-cycle  
**Accessibility:** Single-zone mode for motor impairment; audio-guided mode (zone announced, hold/release cued by tone); adjustable pressure thresholds
