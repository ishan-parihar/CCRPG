# Somatic / Infrared — Scenario-Choice Game Concept

> **Axis:** Survival-movement choices — fight/flight/freeze decisions based on body-state.  **Why this axis for this module:** At Infrared, the only "choices" are somatic — the body decides fight, flight, or freeze before any cognition. This modality surfaces which survival response the body defaults to and whether all three are accessible.

---

## 1. Game Identity

**Name:** Threat-Field  
**Core loop:** Threat appears → body-state shifts (measured) → player enacts a survival response (fight/flight/freeze) → outcome reveals whether the response matched the threat → body resolves or escalates.  
**Feel:** A dark landscape with approaching threats of varying intensity. No words, no instructions — just presence and danger. The player's body tells them what to do. Visceral, immediate, animal.  
**Session length:** 45–120 seconds per checkpoint. Infinite checkpoints.

## 2. Catalyst Delivery

**Catalyst frequency:** Red-ray survival decision — the body's triage system choosing between mobilisation modes.  
**Catalyst → Experience:** Threats of varying intensity provoke genuine arousal. The body must choose: engage (fight-swipe), escape (flight-swipe-away), or endure (freeze-hold-still). Each choice is a real nervous-system decision.  
**Experience → Integration:** Learning that all three responses are available and appropriate in different contexts. The body discovers it is not locked into one mode. Choice-flexibility IS integration at this stage.

**Drive probing:**
- **Agency:** Fight responses — willingness to engage threat directly
- **Communion:** Freeze responses — willingness to yield, endure, wait
- **Eros:** Flight responses — mobilisation toward escape (reaching for safety)
- **Agape:** Return to neutral after any response (completing the cycle)

**Shadow surfacing:**
- DA: Always fights, never flees or freezes; response latency uniformly fast regardless of threat level
- DAll: Always freezes, never fights or flees; or non-response (no choice made)
- GA: Attempts "creative" responses outside fight/flight/freeze (premature complexity)
- GAll: Only flees — movement is only for escape, never engagement or endurance

## 3. Game Design

**Mechanics:**
- Threats approach from screen edges with visual intensity coding (size, speed, colour-heat)
- Three response zones: fight (swipe-toward), flight (swipe-away), freeze (hold-still/press-and-hold)
- Threat-response matching: small threats → fight optimal; overwhelming threats → flight optimal; ambiguous threats → freeze-then-assess optimal
- Response-outcome feedback: matched response → threat resolves, body settles; mismatched → threat escalates
- Body-state tracking: touch-pressure and response latency indicate arousal level

**Adaptive staircase:**
- Threat intensity scales with demonstrated response flexibility
- If DA detected (always-fight): increase overwhelming threats requiring flight/freeze
- If DAll detected (always-freeze): decrease threat intensity until fight/flight emerge
- If GAll detected (only-flight): introduce small, manageable threats rewarding engagement
- Response-window widens for players showing high latency (DAll recovery)

**Progression (within-session):**
1. Single-response: only one threat type, establish baseline response
2. Binary choice: two threat levels requiring different responses
3. Triage: three threat levels, all three responses needed
4. Integration: mixed threats with rest phases, measuring response flexibility and return-to-baseline

## 4. Item Pool

| Item Category | Examples | Shadow Targeted |
|---|---|---|
| Threat intensity | Small/medium/large/overwhelming | Response-matching flexibility |
| Approach speed | Slow (2s), medium (1s), fast (0.5s) | DA (fast bias), DAll (slow needed) |
| Threat direction | Left, right, above, below, centre | Agency (directional engagement) |
| Ambiguous threats | Medium-sized, medium-speed | Freeze-then-assess capacity |
| Safe intervals | 3s, 6s, 10s between threats | Agape (return to rest) |
| Outcome feedback | Threat dissolves, shrinks, retreats, persists | Learning signal |

Threats are never symbolic or narrative — they are pure visual-haptic presences (approaching mass, vibration, heat-glow). The body responds to intensity, not meaning.

## 5. Technical Requirements

**Input:** Touch (swipe direction and force, press-and-hold for freeze), accelerometer (startle detection)  
**Output:** Visual threat-field (approaching masses with intensity coding), haptic escalation, low-frequency audio rumble  
**Timing precision:** Response window measured to millisecond; swipe-direction classified within 50ms of release  
**Data captured:** Per-trial response type (fight/flight/freeze/none), latency, force, threat-response match score, response-type distribution across session, inter-trial arousal proxy  
**Adaptive engine:** Response-type distribution drives threat selection (under-used responses get more optimal-match trials); Bayesian shadow-profile updated per-trial  
**Accessibility:** Simplified input mode (tap-left=fight, tap-right=flight, hold-centre=freeze); adjustable threat speed floor; no flashing for photosensitive players
