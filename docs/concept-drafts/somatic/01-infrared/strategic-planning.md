# Somatic / Infrared — Strategic-Planning Game Concept

> **Axis:** Basic motor sequencing — 2-step movement sequences, reach-then-grip.  **Why this axis for this module:** At Infrared, "planning" is purely somatic — the body's ability to chain two reflexes into a sequence. Reach-then-grip, orient-then-strike. This is the seed of all future strategic capacity, expressed entirely through motor sequencing.

---

## 1. Game Identity

**Name:** Chain  
**Core loop:** Target appears → first movement required (reach/orient) → second movement required (grip/strike/dodge) → sequence completes → difficulty adapts → longer chains introduced.  
**Feel:** Minimal, rhythmic, satisfying. Like a body learning to crawl — each successful chain feels like a small motor victory. Dark background, glowing targets, clean haptic feedback on sequence completion.  
**Session length:** 60–150 seconds per checkpoint. Infinite checkpoints.

## 2. Catalyst Delivery

**Catalyst frequency:** Red-ray motor sequencing — the body learning that one movement can lead to another, that action has consequence and continuation.  
**Catalyst → Experience:** The game requires genuine motor planning at the most basic level. The body must hold the first movement while preparing the second. This is real prefrontal-motor integration at its most primitive.  
**Experience → Integration:** Successful chaining teaches the body that movement is not only reactive but can be sequential. This is the bridge from pure reflex (single response) to proto-planning (two-step response). The seed of all future strategic capacity.

**Drive probing:**
- **Agency:** Force and commitment of each movement in the chain (decisive action)
- **Communion:** Smoothness of transition between movements (flow between steps)
- **Eros:** Willingness to attempt longer chains (reaching toward complexity)
- **Agape:** Ability to return to ready-state between chains (grounded reset)

**Shadow surfacing:**
- DA: Executes both movements simultaneously (cannot sequence, only burst)
- DAll: Completes first movement but fails to initiate second (sequence breaks)
- GA: Attempts 3+ step chains before 2-step is reliable (premature complexity)
- GAll: Only completes survival-coded sequences (dodge-then-flee), refuses reach-then-grip

## 3. Game Design

**Mechanics:**
- Two-zone targets: Zone A (reach/orient) and Zone B (grip/strike) appear in sequence
- Zone A must be engaged first; Zone B appears only after A is completed
- Timing window: B must follow A within 500ms–2000ms (adaptive)
- Chain types: reach→grip, orient→strike, dodge→return, grip→release
- Sequence completion: both zones engaged in order = chain complete

**Adaptive staircase:**
- Inter-movement window narrows as chaining improves
- Chain types diversify as baseline chains stabilise
- If DA detected: enforce pause between A and B (cannot rush)
- If DAll detected: extend B-window, add visual bridge between zones
- If GA detected: restrict to 2-step until reliability >80%
- If GAll detected: introduce non-survival chains gradually (reach→touch, not just dodge→flee)

**Progression (within-session):**
1. Single-step: establish baseline for individual movements (reach OR grip)
2. Two-step: A→B chains with generous timing window
3. Varied chains: multiple chain-types intermixed
4. Integration: chains with rest phases, measuring sequence reliability and reset quality

## 4. Item Pool

| Item Category | Examples | Shadow Targeted |
|---|---|---|
| Chain types | Reach→grip, orient→strike, dodge→return, grip→release | GAll (survival-only bias) |
| Timing windows | 2000ms, 1500ms, 1000ms, 500ms | DA (too fast), DAll (too slow) |
| Zone distances | Adjacent, moderate, far | Agency (commitment to reach) |
| Visual bridges | Arrow, trail, glow-path between A and B | DAll (sequence support) |
| Rest intervals | 3s, 5s, 8s between chains | Agape (reset quality) |
| Chain length | 2-step, 3-step (only after mastery) | GA (premature if forced) |

All chains are motor-only — no symbolic meaning, no narrative context. The body learns sequencing through pure movement, not through understanding.

## 5. Technical Requirements

**Input:** Touch (tap, swipe, hold — sequence and timing tracked), multi-touch for simultaneous detection  
**Output:** Visual targets with sequential illumination, haptic confirmation per step, audio tone-pair on chain completion  
**Timing precision:** Inter-movement interval measured to millisecond; sequence order validated in real-time  
**Data captured:** Per-chain completion rate, inter-movement latency, chain-type distribution, sequence errors (order reversal, simultaneous, timeout), reset quality between chains  
**Adaptive engine:** Timing window adjusted per chain-type independently; chain-type selection weighted by avoidance/failure patterns; shadow-profile updated per-chain  
**Accessibility:** Large touch targets; audio-cued sequence (tone A then tone B); single-hand mode available; adjustable timing floor
